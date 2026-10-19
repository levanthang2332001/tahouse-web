import { Module } from '@nestjs/common';
import { BrandsController } from './brands.controller';
import { AdminBrandsController } from './admin-brands.controller';
import { BrandsService } from './brands.service';
import { BrandsRepository } from './repositories/brands.repository';

@Module({
  controllers: [BrandsController, AdminBrandsController],
  providers: [BrandsService, BrandsRepository],
  exports: [BrandsService, BrandsRepository],
})
export class BrandsModule {}
