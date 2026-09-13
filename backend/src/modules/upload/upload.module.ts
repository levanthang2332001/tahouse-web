import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadService } from './upload.service';
import { AdminUploadController } from './admin-upload.controller';
import { Media, MediaSchema } from './schemas/media.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Media.name, schema: MediaSchema }]),
  ],
  controllers: [AdminUploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
