import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import multer, { memoryStorage, MulterError } from 'multer';
import { Observable } from 'rxjs';
import { BusinessException } from '@/common/exceptions';
import { ErrorCode } from '@/common/constants';
import {
  formatMb,
  MAX_FILES_PER_REQUEST,
  MAX_IMAGE_BYTES,
  MAX_TOTAL_UPLOAD_BYTES,
  MAX_VIDEO_BYTES,
  MediaErrorCode,
} from '../upload.constants';

const tooLargeTotalMessage = () =>
  `Tổng dung lượng tải lên vượt quá ${formatMb(MAX_TOTAL_UPLOAD_BYTES)}. Vui lòng chia nhỏ thành nhiều lần tải.`;

function toUploadException(error: unknown): BusinessException {
  if (error instanceof MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return new BusinessException(
          MediaErrorCode.MEDIA_PAYLOAD_TOO_LARGE,
          `Tệp quá lớn. Ảnh tối đa ${formatMb(MAX_IMAGE_BYTES)}, video tối đa ${formatMb(MAX_VIDEO_BYTES)}.`,
          error.field,
        );
      case 'LIMIT_FILE_COUNT':
        return new BusinessException(
          ErrorCode.MEDIA_VALIDATION_ERROR,
          `Chỉ được tải lên tối đa ${MAX_FILES_PER_REQUEST} tệp mỗi lần.`,
        );
      default:
        return new BusinessException(
          ErrorCode.MEDIA_VALIDATION_ERROR,
          'Dữ liệu tải lên không hợp lệ. Vui lòng chọn lại tệp và thử lại.',
          error.field,
        );
    }
  }
  return new BusinessException(
    ErrorCode.MEDIA_VALIDATION_ERROR,
    'Không đọc được dữ liệu tệp tải lên. Vui lòng thử lại.',
  );
}

/**
 * Nhận multipart/form-data vào bộ nhớ với giới hạn an toàn cho Worker (128MB):
 * tối đa MAX_FILES_PER_REQUEST tệp, mỗi tệp ≤ MAX_VIDEO_BYTES, tổng ≤ MAX_TOTAL_UPLOAD_BYTES.
 * Mọi lỗi trả về thông báo tiếng Việt thay vì lỗi tiếng Anh mặc định của multer.
 */
@Injectable()
export class MediaUploadInterceptor implements NestInterceptor {
  private readonly parse = multer({
    storage: memoryStorage(),
    limits: {
      fileSize: MAX_VIDEO_BYTES,
      files: MAX_FILES_PER_REQUEST,
      fields: 20,
      fieldSize: 64 * 1024,
    },
  }).any();

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    // Từ chối sớm trước khi đọc body vào bộ nhớ
    const contentLength = Number(req.headers?.['content-length']);
    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_TOTAL_UPLOAD_BYTES
    ) {
      throw new BusinessException(
        MediaErrorCode.MEDIA_PAYLOAD_TOO_LARGE,
        tooLargeTotalMessage(),
      );
    }

    await new Promise<void>((resolve, reject) => {
      this.parse(req, res, (err?: unknown) =>
        err ? reject(toUploadException(err)) : resolve(),
      );
    });

    const files: Express.Multer.File[] = Array.isArray(req.files)
      ? req.files
      : [];
    const totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
    if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
      req.files = [];
      throw new BusinessException(
        MediaErrorCode.MEDIA_PAYLOAD_TOO_LARGE,
        tooLargeTotalMessage(),
      );
    }

    return next.handle();
  }
}
