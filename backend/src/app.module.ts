import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@/common/logger/logger.module';
import { ProductsModule } from './modules/products/products.module';

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
    ProductsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
