import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { imageSize } from 'image-size';
import { BusinessException } from '@/common/exceptions';
import { ErrorCode, IErrorCodeDefinition } from '@/common/constants';
import { MediaType } from './schemas/media.schema';
import {
  MediaRepository,
  MediaUsage,
  isMediaInUse,
} from './repositories/media.repository';
import { UploadMediaDto } from './dto/upload-media.dto';
import { QueryMediaDto } from './dto/query-media.dto';
import { MediaResponseDto } from './dto/media-response.dto';
import { determineFileType as determineFileTypeUtil } from './utils/media.util';
import { ALLOWED_TYPES_LABEL, sniffFileType } from './utils/file-sniff';
import {
  ALLOWED_UPLOAD_FOLDERS,
  formatMb,
  isAllowedUploadFolder,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  MediaErrorCode,
} from './upload.constants';

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
    .toLowerCase()
    .trim()
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\-_/ ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Tính toán tỷ lệ khung hình chuẩn từ width & height
 */
function calculateAspectRatio(
  width: number | null,
  height: number | null,
): string | null {
  if (!width || !height || width <= 0 || height <= 0) return null;
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.round(width), Math.round(height));
  const w = Math.round(width) / divisor;
  const h = Math.round(height) / divisor;
  if (w <= 32 && h <= 32) {
    return `${w}:${h}`;
  }
  return `${(width / height).toFixed(2)}:1`;
}

/**
 * Trích xuất kích thước từ buffer hình ảnh (PNG, JPG, WEBP, GIF, AVIF)
 */
export function extractImageDimensions(buffer: Buffer): {
  width: number | null;
  height: number | null;
  aspectRatio: string | null;
} {
  try {
    const dimensions = imageSize(buffer);
    const width = dimensions?.width || null;
    const height = dimensions?.height || null;
    const aspectRatio = calculateAspectRatio(width, height);
    return { width, height, aspectRatio };
  } catch {
    return { width: null, height: null, aspectRatio: null };
  }
}

/**
 * Trích xuất kích thước width, height và duration từ buffer video (MP4, MOV, WEBM...)
 */
export function extractVideoMetadata(buffer: Buffer): {
  width: number | null;
  height: number | null;
  aspectRatio: string | null;
  duration: number | null;
} {
  let width: number | null = null;
  let height: number | null = null;
  let duration: number | null = null;

  try {
    let offset = 0;
    while (offset < buffer.length - 8) {
      const size = buffer.readUInt32BE(offset);
      const type = buffer.toString('ascii', offset + 4, offset + 8);

      if (size === 0 || size > buffer.length) break;

      // Hộp cha chứa metadata video
      if (type === 'moov' || type === 'trak' || type === 'mdia') {
        offset += 8;
        continue;
      }

      // Movie Header Box -> Thời lượng video
      if (type === 'mvhd') {
        const version = buffer.readUInt8(offset + 8);
        const timeScaleOffset =
          version === 1 ? offset + 8 + 16 : offset + 8 + 8;
        const durationOffset =
          version === 1 ? offset + 8 + 20 : offset + 8 + 12;
        if (durationOffset + 8 <= buffer.length) {
          const timescale = buffer.readUInt32BE(timeScaleOffset);
          const rawDuration =
            version === 1
              ? Number(buffer.readBigUInt64BE(durationOffset))
              : buffer.readUInt32BE(durationOffset);
          if (timescale > 0) {
            duration = Math.round((rawDuration / timescale) * 100) / 100;
          }
        }
      }

      // Track Header Box -> Chiều rộng và chiều cao video
      if (type === 'tkhd') {
        const version = buffer.readUInt8(offset + 8);
        const widthOffset = version === 1 ? offset + 8 + 80 : offset + 8 + 68;
        if (widthOffset + 8 <= buffer.length) {
          const w = buffer.readUInt32BE(widthOffset) >> 16;
          const h = buffer.readUInt32BE(widthOffset + 4) >> 16;
          if (w > 0 && h > 0 && (!width || w > width)) {
            width = w;
            height = h;
          }
        }
      }

      offset += size;
    }
  } catch {
    // Ignore buffer parsing error
  }

  const aspectRatio = calculateAspectRatio(width, height);
  return { width, height, aspectRatio, duration };
}

/** Kết quả của 1 tệp tải lên thất bại trong request nhiều tệp */
export interface UploadFailure {
  filename: string;
  status: number;
  errorName?: string;
  message: string;
}

/** Kết quả tải lên nhiều tệp: từng tệp thành công / thất bại kèm lý do */
export interface MultiUploadResult {
  uploaded: MediaResponseDto[];
  failed: UploadFailure[];
  total: number;
  successCount: number;
  failureCount: number;
}

const SETTINGS_USAGE_LABELS: Record<MediaUsage['settings'][number], string> = {
  heroBanners: 'banner hero trang chủ',
  storeImages: 'ảnh cửa hàng',
  promoBanners: 'banner khuyến mãi',
  other: 'cài đặt cửa hàng',
};

/** Làm sạch 1 đoạn đường dẫn: slug, không cho phép "/" lồng thêm cấp thư mục */
function pathSegment(value?: string, maxLength = 80): string {
  return slugify(value ?? '')
    .replace(/\//g, '-')
    .replace(/-+/g, '-')
    .slice(0, maxLength)
    .replace(/^-+|-+$/g, '');
}

function listPreview(values: string[], max = 3): string {
  const shown = values.slice(0, max).join(', ');
  return values.length > max ? `${shown}, …` : shown;
}

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private s3Client: S3Client | null = null;
  private bucketName: string = '';
  private publicUrl: string = '';

  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'R2_SECRET_ACCESS_KEY',
    );
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') || '';
    this.publicUrl = (
      this.configService.get<string>('R2_PUBLIC_URL') ||
      this.configService.get<string>('IMAGE_BASE_URL') ||
      ''
    ).replace(/\/+$/, '');

    if (!accountId || !accessKeyId || !secretAccessKey || !this.bucketName) {
      this.logger.error(
        'Cloudflare R2 credentials (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME) are missing in environment variables!',
      );
      return;
    }

    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.logger.log(
      `Cloudflare R2 Client initialized successfully for bucket [${this.bucketName}]`,
    );
  }

  private getClient(): S3Client {
    if (!this.s3Client) {
      throw new BusinessException(
        MediaErrorCode.MEDIA_STORAGE_ERROR,
        'Kho lưu trữ Cloudflare R2 chưa được cấu hình trên máy chủ. Vui lòng liên hệ quản trị kỹ thuật.',
      );
    }
    return this.s3Client;
  }

  /**
   * Phân loại định dạng theo mime/đuôi tệp đã lưu (chỉ dùng cho hiển thị bản ghi cũ).
   * Khi tải lên, định dạng luôn được xác định bằng magic bytes (sniffFileType).
   */
  determineFileType(mimeType: string, filename: string): MediaType {
    return determineFileTypeUtil(mimeType, filename);
  }

  /**
   * Tính đường dẫn thư mục trên R2: [folder]/[brand]/[category]/[subcategory]/[productCode].
   * folder phải thuộc ALLOWED_UPLOAD_FOLDERS; các cấp con được slug hóa và không thể chứa "/".
   */
  resolveSubfolder(
    options?: UploadMediaDto,
    defaultFolder: string = 'products',
  ): string {
    const rawFolder = options?.folder?.trim().toLowerCase();
    if (rawFolder && !isAllowedUploadFolder(rawFolder)) {
      throw new BusinessException(
        ErrorCode.MEDIA_VALIDATION_ERROR,
        `Thư mục "${options?.folder}" không hợp lệ. Chỉ chấp nhận: ${ALLOWED_UPLOAD_FOLDERS.join(', ')}.`,
        'folder',
        { allowed: [...ALLOWED_UPLOAD_FOLDERS] },
      );
    }

    const hierarchy = [
      pathSegment(options?.brand),
      pathSegment(options?.category),
      pathSegment(options?.subcategory),
      pathSegment(options?.productCode),
    ].filter(Boolean);

    const base =
      rawFolder || (hierarchy.length > 0 ? 'products' : defaultFolder);
    return [base, ...hierarchy].join('/');
  }

  /**
   * Tải 1 file trực tiếp lên Cloudflare R2 và lưu metadata vào D1 qua MediaRepository
   */
  async uploadSingle(
    file: Express.Multer.File,
    dto?: UploadMediaDto,
  ): Promise<MediaResponseDto> {
    const displayName = file?.originalname || 'tệp';

    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BusinessException(
        ErrorCode.MEDIA_VALIDATION_ERROR,
        `Tệp "${displayName}" rỗng (0 byte) hoặc không đọc được.`,
        'file',
      );
    }

    // Không tin Content-Type / đuôi tệp từ client: xác định định dạng thật bằng magic bytes
    const sniffed = sniffFileType(file.buffer);
    if (!sniffed) {
      throw new BusinessException(
        ErrorCode.INVALID_FILE_TYPE,
        `Tệp "${displayName}" không đúng định dạng được hỗ trợ. Chỉ chấp nhận ${ALLOWED_TYPES_LABEL}.`,
        'file',
      );
    }

    const isImage = sniffed.kind === MediaType.IMAGE;
    const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
    const actualSize = file.buffer.length;
    if (actualSize > maxBytes) {
      const sizeInMB = (actualSize / (1024 * 1024)).toFixed(2);
      throw new BusinessException(
        ErrorCode.MEDIA_VALIDATION_ERROR,
        `Tệp "${displayName}" (${sizeInMB}MB) vượt quá dung lượng tối đa cho ${isImage ? 'ảnh' : 'video'} (${formatMb(maxBytes)}).`,
        'file',
      );
    }

    const subFolder = this.resolveSubfolder(
      dto,
      isImage ? 'products' : 'videos',
    );
    const client = this.getClient();

    const baseName = pathSegment(
      path.basename(displayName, path.extname(displayName)),
      60,
    );
    const filename = `${baseName ? `${baseName}-` : ''}${randomUUID()}${sniffed.ext}`;
    const key = `${subFolder}/${filename}`;

    const dims = isImage
      ? { ...extractImageDimensions(file.buffer), duration: null }
      : extractVideoMetadata(file.buffer);

    // 1. Upload buffer lên Cloudflare R2
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: sniffed.mime,
        }),
      );
      this.logger.log(
        `Uploaded to Cloudflare R2: [${key}] (${actualSize} bytes, ${dims.width || '?'}x${dims.height || '?'}, duration: ${dims.duration || 'N/A'})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to upload [${key}] to Cloudflare R2: ${error?.message}`,
        error?.stack,
      );
      throw new BusinessException(
        MediaErrorCode.MEDIA_STORAGE_ERROR,
        `Không tải được tệp "${displayName}" lên kho lưu trữ R2. Vui lòng thử lại.`,
      );
    }

    // 2. Lưu metadata vào D1; nếu thất bại thì gỡ object vừa tải để không để lại tệp mồ côi
    try {
      return await this.mediaRepository.create({
        id: randomUUID(),
        filename,
        url: this.publicUrl ? `${this.publicUrl}/${key}` : `/${key}`,
        key,
        mimeType: sniffed.mime,
        size: actualSize,
        folder: subFolder,
        brand: dto?.brand ? slugify(dto.brand) : null,
        category: dto?.category ? slugify(dto.category) : null,
        subcategory: dto?.subcategory ? slugify(dto.subcategory) : null,
        productCode: dto?.productCode ? dto.productCode.trim() : null,
        metadata: {
          extension: sniffed.ext,
          originalName: displayName,
          width: dims.width,
          height: dims.height,
          aspectRatio: dims.aspectRatio,
          duration: dims.duration,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to save media record for [${key}]: ${error?.message}`,
        error?.stack,
      );
      const rolledBack = await this.removeObjectQuietly(client, key);
      throw new BusinessException(
        MediaErrorCode.MEDIA_DB_ERROR,
        rolledBack
          ? `Không lưu được thông tin tệp "${displayName}" vào cơ sở dữ liệu nên tệp đã được hoàn tác. Vui lòng thử lại.`
          : `Không lưu được thông tin tệp "${displayName}" vào cơ sở dữ liệu. Vui lòng thử lại.`,
      );
    }
  }

  /**
   * 1 tệp: trả về MediaResponseDto (giữ nguyên định dạng cũ cho các uploader).
   * Nhiều tệp: tải song song, trả về từng tệp thành công / thất bại. Nếu không tệp nào thành công thì báo lỗi.
   */
  async uploadFiles(
    files: Express.Multer.File[],
    dto?: UploadMediaDto,
  ): Promise<MediaResponseDto | MultiUploadResult> {
    if (!files || files.length === 0) {
      throw new BusinessException(
        ErrorCode.MEDIA_VALIDATION_ERROR,
        'Vui lòng chọn ít nhất một tệp để tải lên.',
        'file',
      );
    }

    if (files.length === 1) {
      return this.uploadSingle(files[0], dto);
    }

    // Thư mục sai thì mọi tệp đều sai: báo lỗi một lần
    this.resolveSubfolder(dto);

    const settled = await Promise.allSettled(
      files.map((file) => this.uploadSingle(file, dto)),
    );

    const uploaded: MediaResponseDto[] = [];
    const failed: UploadFailure[] = [];
    settled.forEach((result, i) => {
      if (result.status === 'fulfilled') uploaded.push(result.value);
      else failed.push(this.toUploadFailure(files[i], result.reason));
    });

    if (uploaded.length === 0) {
      const statuses = new Set(failed.map((f) => f.status));
      const status =
        statuses.size === 1
          ? [...statuses][0]
          : failed.every((f) => f.status < 500)
            ? HttpStatus.BAD_REQUEST
            : HttpStatus.BAD_GATEWAY;
      const errorDef: IErrorCodeDefinition = {
        ...MediaErrorCode.MEDIA_UPLOAD_FAILED,
        httpStatus: status,
      };
      throw new BusinessException(
        errorDef,
        `Không tải lên được tệp nào. ${failed.map((f) => f.message).join(' ')}`,
        undefined,
        { failed },
      );
    }

    return {
      uploaded,
      failed,
      total: files.length,
      successCount: uploaded.length,
      failureCount: failed.length,
    };
  }

  private toUploadFailure(
    file: Express.Multer.File,
    reason: unknown,
  ): UploadFailure {
    const filename = file?.originalname || 'tệp';
    if (reason instanceof HttpException) {
      const response = reason.getResponse() as
        | string
        | { message?: string | string[]; errorName?: string };
      const message =
        typeof response === 'string'
          ? response
          : Array.isArray(response?.message)
            ? response.message.join(', ')
            : response?.message || reason.message;
      return {
        filename,
        status: reason.getStatus(),
        errorName:
          typeof response === 'string' ? undefined : response?.errorName,
        message,
      };
    }
    this.logger.error(
      `Unexpected upload failure for [${filename}]: ${(reason as Error)?.message}`,
      (reason as Error)?.stack,
    );
    return {
      filename,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `Lỗi không xác định khi tải tệp "${filename}". Vui lòng thử lại.`,
    };
  }

  async findAll(query: QueryMediaDto) {
    return this.mediaRepository.findAllPaginated(query);
  }

  async findById(id: string) {
    const item = await this.mediaRepository.findById(id);
    if (!item) {
      throw new BusinessException(
        ErrorCode.MEDIA_NOT_FOUND,
        'Không tìm thấy tệp',
      );
    }
    return item;
  }

  /**
   * Xóa tệp qua bản ghi media trong D1 (theo id, key hoặc URL đã lưu).
   * - Không có bản ghi → 404, không bao giờ xóa key R2 tùy ý.
   * - Đang được sử dụng → 409 kèm tóm tắt, trừ khi force = true.
   * - Xóa R2 lỗi → giữ nguyên bản ghi D1 và báo lỗi 502.
   */
  async deleteMedia(
    idOrKeyOrUrl: string,
    options: { force?: boolean } = {},
  ): Promise<{ message: string; deletedId: string; key: string }> {
    const target = (idOrKeyOrUrl || '').trim();
    if (!target) {
      throw new BusinessException(
        ErrorCode.MEDIA_VALIDATION_ERROR,
        'Thiếu ID hoặc URL của tệp cần xóa.',
      );
    }

    const mediaDoc = await this.mediaRepository.findByIdOrKey(
      target,
      this.extractKeyFromUrl(target),
    );
    if (!mediaDoc) {
      throw new BusinessException(
        ErrorCode.MEDIA_NOT_FOUND,
        'Không tìm thấy tệp',
      );
    }

    if (!options.force) {
      let usage: MediaUsage;
      try {
        usage = await this.mediaRepository.findUsages([
          mediaDoc.key,
          mediaDoc.url,
        ]);
      } catch (error) {
        this.logger.error(
          `Failed to check usages of [${mediaDoc.key}]: ${error?.message}`,
          error?.stack,
        );
        throw new BusinessException(
          MediaErrorCode.MEDIA_DB_ERROR,
          'Không kiểm tra được tệp có đang được sử dụng hay không. Tệp chưa bị xóa, vui lòng thử lại.',
        );
      }

      if (isMediaInUse(usage)) {
        const summary = this.describeUsage(usage, mediaDoc.mimeType);
        throw new BusinessException(
          MediaErrorCode.MEDIA_IN_USE,
          summary,
          undefined,
          { usage, summary },
        );
      }
    }

    const client = this.getClient();
    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: mediaDoc.key,
        }),
      );
      this.logger.log(`Deleted file from Cloudflare R2: [${mediaDoc.key}]`);
    } catch (error) {
      this.logger.error(
        `Cloudflare R2 delete failed for [${mediaDoc.key}]: ${error?.message}`,
        error?.stack,
      );
      throw new BusinessException(
        MediaErrorCode.MEDIA_STORAGE_ERROR,
        'Không xóa được tệp trên kho lưu trữ R2. Tệp vẫn được giữ nguyên, vui lòng thử lại.',
      );
    }

    try {
      await this.mediaRepository.delete(mediaDoc.id);
    } catch (error) {
      this.logger.error(
        `Failed to delete media record [${mediaDoc.id}] after R2 delete: ${error?.message}`,
        error?.stack,
      );
      throw new BusinessException(
        MediaErrorCode.MEDIA_DB_ERROR,
        'Đã xóa tệp trên R2 nhưng chưa cập nhật được cơ sở dữ liệu. Vui lòng bấm xóa lại để hoàn tất.',
      );
    }

    return {
      message: 'Đã xóa tệp khỏi Cloudflare R2 và cơ sở dữ liệu',
      deletedId: mediaDoc.id,
      key: mediaDoc.key,
    };
  }

  /** Ví dụ: "Ảnh đang được dùng ở: 2 sản phẩm (KL-989F, KL-600), banner hero trang chủ" */
  describeUsage(usage: MediaUsage, mimeType?: string): string {
    const parts: string[] = [];
    if (usage.products.length > 0) {
      parts.push(
        `${usage.products.length} sản phẩm (${listPreview(usage.products.map((p) => p.code))})`,
      );
    }
    if (usage.brands.length > 0) {
      parts.push(
        `logo ${usage.brands.length} thương hiệu (${listPreview(usage.brands.map((b) => b.name))})`,
      );
    }
    for (const list of usage.settings) {
      parts.push(SETTINGS_USAGE_LABELS[list]);
    }
    const subject = (mimeType || '').startsWith('video/') ? 'Video' : 'Ảnh';
    return `${subject} đang được dùng ở: ${parts.join(', ')}`;
  }

  private async removeObjectQuietly(
    client: S3Client,
    key: string,
  ): Promise<boolean> {
    try {
      await client.send(
        new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }),
      );
      this.logger.warn(`Rolled back orphaned R2 object [${key}]`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to roll back orphaned R2 object [${key}]: ${error?.message}`,
        error?.stack,
      );
      return false;
    }
  }

  /** Lấy key từ URL công khai hoặc đường dẫn tương đối (chỉ dùng để tra bản ghi D1) */
  private extractKeyFromUrl(fileUrlOrKey: string): string {
    let key = fileUrlOrKey;
    if (/^https?:\/\//i.test(fileUrlOrKey)) {
      try {
        key = decodeURIComponent(new URL(fileUrlOrKey).pathname);
      } catch {
        // giữ nguyên giá trị gốc
      }
    }
    key = key.replace(/^\/+/, '');
    if (key.startsWith('uploads/')) {
      key = key.replace(/^uploads\//, '');
    }
    return key;
  }
}
