import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { AdminUploadController } from './admin-upload.controller';

@Module({
  controllers: [AdminUploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
