import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Product,
  ProductSchema,
} from '@/modules/products/schemas/product.schema';
import { Brand, BrandSchema } from '@/modules/brands/schemas/brand.schema';
import { StatsService } from './stats.service';
import { AdminStatsController } from './admin-stats.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Brand.name, schema: BrandSchema },
    ]),
  ],
  controllers: [AdminStatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
