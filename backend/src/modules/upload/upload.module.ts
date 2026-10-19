import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { AdminUploadController } from './admin-upload.controller';
import { MediaRepository } from './repositories/media.repository';

@Module({
  controllers: [AdminUploadController],
  providers: [UploadService, MediaRepository],
  exports: [UploadService, MediaRepository],
})
export class UploadModule {}
