import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MediaDocument = Media & Document;

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  OTHER = 'other',
}

@Schema({
  collection: 'media',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: any) => {
      ret.id = ret._id?.toString();
      delete ret.__v;
      return ret;
    },
  },
})
export class Media {
  @Prop({ required: true, unique: true, trim: true })
  key: string; // Relative key path on storage (e.g. products/kaadas/.../file.png)

  @Prop({ required: true, trim: true })
  filename: string;

  @Prop({ required: true, trim: true })
  originalName: string;

  @Prop({ required: true, trim: true })
  mimeType: string;

  @Prop({ required: true, enum: Object.values(MediaType), default: MediaType.IMAGE })
  fileType: string;

  @Prop({ required: true, default: 0 })
  size: number; // Dung lượng tệp tin (bytes)

  @Prop({ type: Number, default: null })
  width: number | null; // Chiều rộng ảnh / video (pixels)

  @Prop({ type: Number, default: null })
  height: number | null; // Chiều cao ảnh / video (pixels)

  @Prop({ type: String, default: null })
  aspectRatio: string | null; // Tỷ lệ khung hình ảnh / video (e.g. "16:9", "9:16", "1:1", "4:3")

  @Prop({ type: Number, default: null })
  duration: number | null; // Thời lượng video / audio (tính bằng giây, ví dụ: 45.5)

  @Prop({ required: true, default: 'r2' })
  storage: string; // Storage provider identifier

  @Prop({ required: true, trim: true })
  bucket: string; // Bucket name (e.g. cuongcorex)

  @Prop({ trim: true, default: 'products' })
  folder: string; // Base folder path

  @Prop({ trim: true, default: '' })
  brand: string; // Brand slug (e.g. kaadas)

  @Prop({ trim: true, default: '' })
  category: string; // Category slug (e.g. khoa-cua-dien-tu)

  @Prop({ trim: true, default: '' })
  subcategory: string; // Subcategory slug (e.g. khoa-nhan-dien-khuon-mat)

  @Prop({ trim: true, default: '' })
  productCode: string; // Product code (e.g. KL-589FG)

  @Prop({ trim: true, default: '' })
  title: string;

  @Prop({ trim: true, default: '' })
  altText: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ trim: true, default: 'admin' })
  uploadedBy: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const MediaSchema = SchemaFactory.createForClass(Media);

MediaSchema.index({ brand: 1, category: 1, subcategory: 1, productCode: 1 });
MediaSchema.index({ fileType: 1 });
MediaSchema.index({ createdAt: -1 });
