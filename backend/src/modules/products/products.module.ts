import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { AdminProductsController } from './admin-products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';
import { BrandsModule } from '../brands/brands.module';

@Module({
  imports: [BrandsModule],
  controllers: [ProductsController, AdminProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
