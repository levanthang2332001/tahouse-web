import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from './user.schema';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({
  collection: 'refresh_tokens',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: any) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_, ret: any) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class RefreshToken {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true, unique: true })
  hashedToken: string;

  @Prop({ type: String, default: '' })
  userAgent?: string;

  @Prop({ type: String, default: '' })
  ipAddress?: string;

  @Prop({ type: Boolean, default: false, index: true })
  isRevoked: boolean;

  @Prop({ type: Date, required: true })
  expiresAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

// TTL Index: MongoDB tự động dọn dẹp các token hết hạn
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RefreshTokenSchema.index({ userId: 1, isRevoked: 1 });
