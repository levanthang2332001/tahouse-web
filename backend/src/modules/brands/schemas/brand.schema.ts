import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BrandDocument = Brand & Document;

@Schema({ _id: false })
export class Subcategory {
  @Prop({ type: String, required: true })
  slug: string;

  @Prop({ type: String, required: true })
  name: string;
}

@Schema({ _id: false })
export class Category {
  @Prop({ type: String, required: true })
  slug: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: [Subcategory], default: [] })
  subcategories?: Subcategory[];
}

@Schema({
  collection: 'brands',
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
export class Brand {
  @Prop({ type: Number, required: true, unique: true })
  id: number;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: String, default: '' })
  logo: string;

  @Prop({ type: String, default: '' })
  logoHtml?: string;

  @Prop({ type: [Category], default: [] })
  categories: Category[];
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
