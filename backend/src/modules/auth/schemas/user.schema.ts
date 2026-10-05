import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  collection: 'users',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: any) => {
      if (!ret.id && ret._id) {
        ret.id = ret._id.toString();
      }
      delete ret.password;
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
      delete ret.password;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class User {
  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  username: string;

  @Prop({
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    sparse: true,
  })
  email?: string;

  @Prop({ type: String, default: 'Admin TA House' })
  fullName?: string;

  @Prop({ type: String, select: false })
  password?: string;

  @Prop({ type: String, default: '' })
  avatarUrl?: string;

  @Prop({ type: String, default: 'ADMIN' })
  role?: string;

  @Prop({ type: [String], default: ['*'] })
  permissions?: string[];

  @Prop({ type: Boolean, default: true })
  isActive?: boolean;

  @Prop({ type: Date, default: null })
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
