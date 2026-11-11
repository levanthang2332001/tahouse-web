import { HttpStatus } from '@nestjs/common';
import { IErrorCodeDefinition } from '@/common/constants/error-codes';

const MB = 1024 * 1024;

/** Dung lượng tối đa cho 1 ảnh */
export const MAX_IMAGE_BYTES = 15 * MB;
/** Dung lượng tối đa cho 1 video (Worker chỉ có 128MB bộ nhớ) */
export const MAX_VIDEO_BYTES = 50 * MB;
/** Số tệp tối đa trong 1 request */
export const MAX_FILES_PER_REQUEST = 10;
/** Tổng dung lượng tối đa của 1 request tải lên (toàn bộ request nằm trong bộ nhớ Worker) */
export const MAX_TOTAL_UPLOAD_BYTES = 60 * MB;

export const formatMb = (bytes: number): string =>
  `${Math.round(bytes / MB)}MB`;

/**
 * Thư mục gốc được phép ghi lên R2. Lấy từ các nơi gọi `/api/admin/upload` ở frontend:
 * products (ImageUploader, RichTextEditor, ProductForm), jobs (ProductForm), brands (trang thương hiệu),
 * banners (HeroBannersSettings), promo (PromoBannersSettings), store (StoreImagesSettings),
 * và các thư mục của trang Thư viện Media (avatars, videos, documents, categories).
 */
export const ALLOWED_UPLOAD_FOLDERS = [
  'products',
  'jobs',
  'brands',
  'categories',
  'banners',
  'promo',
  'store',
  'avatars',
  'videos',
  'documents',
] as const;

export type UploadFolder = (typeof ALLOWED_UPLOAD_FOLDERS)[number];

export function isAllowedUploadFolder(value: string): value is UploadFolder {
  return (ALLOWED_UPLOAD_FOLDERS as readonly string[]).includes(value);
}

/** Mã lỗi riêng của module Media (7xxx), bổ sung cho ErrorCode chung */
export const MediaErrorCode = {
  MEDIA_IN_USE: {
    errorCode: 7003,
    errorName: 'MEDIA_IN_USE',
    httpStatus: HttpStatus.CONFLICT,
  },
  MEDIA_STORAGE_ERROR: {
    errorCode: 7004,
    errorName: 'MEDIA_STORAGE_ERROR',
    httpStatus: HttpStatus.BAD_GATEWAY,
  },
  MEDIA_DB_ERROR: {
    errorCode: 7005,
    errorName: 'MEDIA_DB_ERROR',
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  MEDIA_PAYLOAD_TOO_LARGE: {
    errorCode: 7006,
    errorName: 'MEDIA_PAYLOAD_TOO_LARGE',
    httpStatus: HttpStatus.PAYLOAD_TOO_LARGE,
  },
  MEDIA_UPLOAD_FAILED: {
    errorCode: 7007,
    errorName: 'MEDIA_UPLOAD_FAILED',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
} as const satisfies Record<string, IErrorCodeDefinition>;
