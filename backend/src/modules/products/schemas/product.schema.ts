import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ _id: false })
export class ProductVariant {
  @Prop({ type: String })
  id: string;

  @Prop({ type: String })
  label: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  attributes: Record<string, any>;

  @Prop({ type: Number, default: null })
  price: number | null;

  @Prop({ type: Number, default: null })
  originalPrice?: number;

  @Prop({ type: Number, default: null })
  discountPercent?: number;

  @Prop({ type: String, default: '' })
  priceRange: string;

  @Prop({ type: Boolean, default: false })
  is_default: boolean;
}

@Schema({ _id: false })
export class ProductOption {
  @Prop({ type: String })
  name: string;

  @Prop({ type: [String], default: [] })
  values: string[];
}

@Schema({ _id: false })
export class ProductInstallation {
  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  videos: string[];
}

@Schema({ _id: false })
export class ProductFaq {
  @Prop({ type: String })
  question: string;

  @Prop({ type: String })
  answer: string;
}

@Schema({
  collection: 'products',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: any) => {
      if (!ret.id && ret._id) {
        ret.id = ret._id.toString();
      }
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_, ret: any) => {
      if (!ret.id && ret._id) {
        ret.id = ret._id.toString();
      }
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Product {
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Prop({ type: String, required: true, unique: true })
  code: string;

  @Prop({ type: Number, index: true, default: null })
  brandId?: number;

  @Prop({ type: String, default: '', index: true })
  category: string;

  @Prop({ type: String, default: '', index: true })
  subcategory: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, default: '' })
  shortDescription: string;

  @Prop({ type: String, default: '' })
  content?: string;

  @Prop({ type: String, default: '' })
  imageUrl: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: Number, default: null, index: true })
  price: number | null;

  @Prop({ type: Number, default: null })
  originalPrice?: number;

  @Prop({ type: Number, default: null })
  discountPercent?: number;

  @Prop({ type: String, default: '' })
  priceRange: string;

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  specs: Record<string, any>;

  @Prop({ type: [String], default: [] })
  technologies: string[];

  @Prop({ type: Number, default: 36 })
  warranty: number;

  @Prop({ type: String, default: '' })
  warrantyText: string;

  @Prop({ type: [String], default: [] })
  colors: string[];

  @Prop({
    type: ProductInstallation,
    default: () => ({ images: [], videos: [] }),
  })
  installation: ProductInstallation;

  @Prop({ type: [String], default: [] })
  installationManual?: string[];

  @Prop({ type: [ProductFaq], default: [] })
  faq?: ProductFaq[];

  @Prop({ type: Boolean, default: false })
  has_variants: boolean;

  @Prop({ type: [ProductOption], default: [] })
  options?: ProductOption[];

  @Prop({ type: [ProductVariant], default: [] })
  variants?: ProductVariant[];

  @Prop({ type: Number, default: 9999, index: true })
  priority?: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Index hỗ trợ tìm kiếm và sắp xếp
ProductSchema.index({ category: 1, priority: 1 });
ProductSchema.index({ brandId: 1, priority: 1 });
ProductSchema.index({ name: 'text', description: 'text', code: 'text' });
