import { NestFactory, Reflector } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { config } from '@/common/config';
import { GlobalExceptionFilter } from '@/common/filters';
import { validationExceptionFactory } from '@/common/exceptions';
import { LoggingInterceptor } from '@/common/logger/logging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { SwaggerTag } from '@/common/constants';

/**
 * Hàm khởi động ứng dụng (Bootstrap).
 * Thực hiện cấu hình các thành phần hệ thống:
 * 1. Khởi tạo ứng dụng NestJS từ AppModule.
 * 2. Thiết lập ValidationPipe toàn cục để kiểm tra dữ liệu đầu vào.
 * 3. Đăng ký Global Filter để chuẩn hóa mã lỗi.
 * 4. Đăng ký Global Interceptor (LoggingInterceptor, TransformInterceptor).
 * 5. Cấu hình CORS cho phép truy cập từ mọi nguồn.
 * 6. Cấu hình Static Assets cho /public và /uploads.
 * 7. Cấu hình Swagger API Docs tại /api/docs.
 * 8. Lắng nghe trên cổng được cấu hình trong file môi trường.
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Ảnh catalogue local và static assets
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });

  // Đường dẫn static phục vụ file/ảnh/video upload
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(reflector),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Cấu hình Swagger API Docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('TA House API')
    .setDescription('Tài liệu API cho hệ thống TA House Web')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag(SwaggerTag.PRODUCTS, 'API quản lý sản phẩm khóa cửa')
    .addTag(SwaggerTag.BRANDS, 'API thương hiệu')
    .addTag(SwaggerTag.AUTH, 'API xác thực và quản lý phiên đăng nhập')
    .addTag(SwaggerTag.ADMIN_PRODUCTS, 'API quản trị sản phẩm')
    .addTag(SwaggerTag.ADMIN_BRANDS, 'API quản trị thương hiệu')
    .addTag(
      SwaggerTag.ADMIN_UPLOAD,
      'API tải lên và quản lý tệp tin (Ảnh, Video, Tài liệu)',
    )
    .addTag(SwaggerTag.SETTINGS, 'API thông tin liên hệ & cấu hình cửa hàng')
    .addTag(
      SwaggerTag.ADMIN_SETTINGS,
      'API quản trị cấu hình hệ thống (Social, SĐT, Email, Địa chỉ, Giờ mở cửa)',
    )
    .addTag(
      SwaggerTag.ADMIN_CHAT,
      'API quản trị phiên trò chuyện & audit chatbot (IP, Browser, OS, Origin)',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(config.port, '0.0.0.0');
  logger.log(`Application is running on: http://localhost:${config.port}`);
  logger.log(
    `Swagger document is available at: http://localhost:${config.port}/api/docs`,
  );
}
bootstrap();
