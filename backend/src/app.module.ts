import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@/common/logger/logger.module';
import { DatabaseModule } from './modules/database/database.module';
import { ProductsModule } from './modules/products/products.module';
import { BrandsModule } from './modules/brands/brands.module';

/**
 * Module gốc (Root Module) của toàn bộ ứng dụng.
 * Thực hiện nạp các module cấu hình (ConfigModule) và module log (LoggerModule).
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    LoggerModule,
    DatabaseModule,
    ProductsModule,
    BrandsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
