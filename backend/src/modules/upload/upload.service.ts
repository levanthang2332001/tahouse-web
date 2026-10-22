import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
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
import { MediaType } from './schemas/media.schema';
import { MediaRepository } from './repositories/media.repository';
import { UploadMediaDto } from './dto/upload-media.dto';
import { QueryMediaDto } from './dto/query-media.dto';

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
 * Trích xuất kích thước từ buffer hình ảnh (PNG, JPG, WEBP, GIF, SVG, AVIF...)
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
      throw new InternalServerErrorException(
        'Cloudflare R2 storage is not configured. Please check environment variables.',
      );
    }
    return this.s3Client;
  }

  /**
   * Phân loại định dạng file tự động
   */
  determineFileType(mimeType: string, filename: string): MediaType {
    const mime = (mimeType || '').toLowerCase();
    const ext = path.extname(filename || '').toLowerCase();

    if (mime.startsWith('image/')) return MediaType.IMAGE;
    if (mime.startsWith('video/')) return MediaType.VIDEO;
    if (mime.startsWith('audio/')) return MediaType.AUDIO;

    const docExtensions = [
      '.pdf',
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
      '.ppt',
      '.pptx',
      '.txt',
      '.zip',
      '.rar',
      '.7z',
      '.csv',
    ];
    if (
      docExtensions.includes(ext) ||
      mime.includes('pdf') ||
      mime.includes('document') ||
      mime.includes('sheet') ||
      mime.includes('zip')
    ) {
      return MediaType.DOCUMENT;
    }

    return MediaType.OTHER;
  }

  /**
   * Tính toán đường dẫn thư mục lưu trữ trên Cloudflare R2 theo brand / cate / subcate / productCode
   */
  resolveSubfolder(
    options?: UploadMediaDto,
    defaultFolder: string = 'products',
  ): string {
    if (!options) return defaultFolder;

    const { folder, brand, category, subcategory, productCode } = options;

    const segments: string[] = [];

    if (brand || category || subcategory || productCode) {
      const baseFolder = folder ? slugify(folder) : 'products';
      segments.push(baseFolder);

      if (brand) segments.push(slugify(brand));
      if (category) segments.push(slugify(category));
      if (subcategory) segments.push(slugify(subcategory));
      if (productCode) segments.push(slugify(productCode));
    } else if (folder) {
      segments.push(slugify(folder));
    } else {
      segments.push(defaultFolder);
    }

    return segments.filter(Boolean).join('/') || defaultFolder;
  }

  private generateSafeFilename(originalname: string): string {
    const ext = path.extname(originalname).toLowerCase();
    const nameWithoutExt = path.basename(originalname, ext);
    const safeName = slugify(nameWithoutExt);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
    return `${safeName}-${uniqueSuffix}${ext}`;
  }

  /**
   * Tải 1 file trực tiếp lên Cloudflare R2 và lưu metadata vào D1 qua MediaRepository
   */
  async uploadSingle(file: Express.Multer.File, dto?: UploadMediaDto) {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException(
        'Uploaded file is empty (0 bytes) or invalid',
      );
    }

    const fileType = this.determineFileType(file.mimetype, file.originalname);

    // Ràng buộc bảo mật: Chỉ cho phép tải lên Hình ảnh và Video
    if (fileType !== MediaType.IMAGE && fileType !== MediaType.VIDEO) {
      throw new BadRequestException(
        `Chỉ cho phép tải lên tệp tin Hình ảnh hoặc Video. Tệp "${file.originalname}" không được hỗ trợ.`,
      );
    }

    const MAX_FILE_SIZES: Record<string, { maxBytes: number; label: string }> =
      {
        [MediaType.IMAGE]: { maxBytes: 15 * 1024 * 1024, label: '15MB' },
        [MediaType.VIDEO]: { maxBytes: 100 * 1024 * 1024, label: '100MB' },
      };

    const limit = MAX_FILE_SIZES[fileType] || MAX_FILE_SIZES[MediaType.OTHER];
    const actualSize = file.size || file.buffer.length;

    if (actualSize > limit.maxBytes) {
      const sizeInMB = (actualSize / (1024 * 1024)).toFixed(2);
      throw new BadRequestException(
        `File "${file.originalname}" (${sizeInMB}MB) exceeds the maximum allowed size for ${fileType.toUpperCase()} (Max: ${limit.label})`,
      );
    }

    const client = this.getClient();
    const defaultFolder =
      fileType === MediaType.IMAGE
        ? 'products'
        : fileType === MediaType.VIDEO
          ? 'videos'
          : 'documents';

    const subFolder = this.resolveSubfolder(dto, defaultFolder);
    const filename = this.generateSafeFilename(file.originalname);
    const key = `${subFolder}/${filename}`;

    let width: number | null = null;
    let height: number | null = null;
    let aspectRatio: string | null = null;
    let duration: number | null = null;

    if (fileType === MediaType.IMAGE) {
      const imgDim = extractImageDimensions(file.buffer);
      width = imgDim.width;
      height = imgDim.height;
      aspectRatio = imgDim.aspectRatio;
    } else if (fileType === MediaType.VIDEO) {
      const vidMeta = extractVideoMetadata(file.buffer);
      width = vidMeta.width;
      height = vidMeta.height;
      aspectRatio = vidMeta.aspectRatio;
      duration = vidMeta.duration;
    }

    try {
      // 1. Upload buffer lên Cloudflare R2
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await client.send(command);
      this.logger.log(
        `Uploaded to Cloudflare R2: [${key}] (${file.size} bytes, ${width || '?'}x${height || '?'}, duration: ${duration || 'N/A'})`,
      );

      const metadataObj = {
        extension: path.extname(file.originalname).toLowerCase(),
        width,
        height,
        aspectRatio,
        duration,
      };

      const newId = randomUUID();
      const brandVal = dto?.brand ? slugify(dto.brand) : null;
      const categoryVal = dto?.category ? slugify(dto.category) : null;
      const subcategoryVal = dto?.subcategory ? slugify(dto.subcategory) : null;
      const productCodeVal = dto?.productCode ? dto.productCode.trim() : null;

      // 2. Lưu document metadata qua MediaRepository
      return this.mediaRepository.create({
        id: newId,
        filename,
        url: this.publicUrl ? `${this.publicUrl}/${key}` : `/${key}`,
        key,
        mimeType: file.mimetype,
        size: file.size || file.buffer.length,
        folder: subFolder,
        brand: brandVal,
        category: categoryVal,
        subcategory: subcategoryVal,
        productCode: productCodeVal,
        metadata: metadataObj,
      });
    } catch (error) {
      this.logger.error(
        `Failed to upload to Cloudflare R2: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Cloudflare R2 upload error: ${error.message}`,
      );
    }
  }

  async uploadFiles(files: Express.Multer.File[], dto?: UploadMediaDto) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided in request');
    }

    if (files.length === 1) {
      return this.uploadSingle(files[0], dto);
    }

    return Promise.all(files.map((file) => this.uploadSingle(file, dto)));
  }

  async findAll(query: QueryMediaDto) {
    return this.mediaRepository.findAllPaginated(query);
  }

  async findById(id: string) {
    const item = await this.mediaRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Media document not found with ID [${id}]`);
    }
    return item;
  }

  async deleteMedia(
    idOrKeyOrUrl: string,
  ): Promise<{ message: string; deletedId?: string; key: string }> {
    if (!idOrKeyOrUrl) {
      throw new BadRequestException('ID, URL or Key is required');
    }

    const client = this.getClient();
    const cleanKey = this.extractKeyFromUrl(idOrKeyOrUrl);

    // Tìm media record trong D1
    const mediaDoc = await this.mediaRepository.findByIdOrKey(
      idOrKeyOrUrl,
      cleanKey,
    );
    const key = mediaDoc ? mediaDoc.key : cleanKey;

    // Xóa khỏi Cloudflare R2
    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      this.logger.log(`Deleted file from Cloudflare R2: [${key}]`);
    } catch (e) {
      this.logger.warn(
        `Cloudflare R2 delete warning for [${key}]: ${e.message}`,
      );
    }

    // Xóa document khỏi D1
    if (mediaDoc) {
      await this.mediaRepository.delete(mediaDoc.id);
    }

    return {
      message: 'Media deleted successfully from Cloudflare R2 and database',
      deletedId: mediaDoc?.id,
      key,
    };
  }

  private extractKeyFromUrl(fileUrlOrKey: string): string {
    let key = fileUrlOrKey;
    if (fileUrlOrKey.startsWith('http')) {
      try {
        const urlObj = new URL(fileUrlOrKey);
        key = urlObj.pathname.replace(/^\/+/, '');
        if (key.startsWith('uploads/')) {
          key = key.replace(/^uploads\//, '');
        }
      } catch {
        // fallback
      }
    }
    return key;
  }
}
