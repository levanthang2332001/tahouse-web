import { MediaType } from '../schemas/media.schema';
import { determineFileType } from '../utils/media.util';

export class MediaResponseDto {
  id: string;
  url: string;
  key: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileType: MediaType;
  size: number;
  width: number | null;
  height: number | null;
  aspectRatio: string | null;
  duration: number | null;
  storage: string;
  bucket: string;
  folder: string;
  brand: string | null;
  category: string | null;
  subcategory: string | null;
  productCode: string | null;
  title: string;
  altText: string;
  description: string;
  uploadedBy: string;
  metadata: Record<string, any>;
  createdAt: any;
  updatedAt: any;

  static fromEntity(
    raw: any,
    publicUrl: string = '',
    bucketName: string = '',
  ): MediaResponseDto | null {
    if (!raw) return null;

    const id = raw.id || (raw._id ? raw._id.toString() : '');
    const key = raw.key || '';
    const url = raw.url || (publicUrl ? `${publicUrl}/${key}` : `/${key}`);

    const metadata =
      typeof raw.metadata === 'string'
        ? (() => {
            try {
              return JSON.parse(raw.metadata);
            } catch {
              return {};
            }
          })()
        : raw.metadata || {};

    const mime = raw.mimeType || raw.mime_type || '';
    const filename = raw.filename || '';

    return {
      id,
      url,
      key,
      filename,
      originalName: raw.originalName || filename,
      mimeType: mime,
      fileType: raw.fileType || determineFileType(mime, filename),
      size: raw.size || 0,
      width: raw.width ?? metadata?.width ?? null,
      height: raw.height ?? metadata?.height ?? null,
      aspectRatio: raw.aspectRatio ?? metadata?.aspectRatio ?? null,
      duration: raw.duration ?? metadata?.duration ?? null,
      storage: raw.storage || 'r2',
      bucket: raw.bucket || bucketName,
      folder: raw.folder || '',
      brand: raw.brand || null,
      category: raw.category || null,
      subcategory: raw.subcategory || null,
      productCode: raw.productCode || raw.product_code || null,
      title: raw.title || filename,
      altText:
        raw.altText ||
        (raw.productCode || raw.product_code
          ? `${raw.productCode || raw.product_code} ${filename}`
          : filename),
      description: raw.description || '',
      uploadedBy: raw.uploadedBy || 'admin',
      metadata,
      createdAt: raw.createdAt || raw.created_at,
      updatedAt: raw.updatedAt || raw.updated_at,
    };
  }
}
