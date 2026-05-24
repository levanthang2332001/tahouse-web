import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { config } from '@/common/config';
import { ExternalApiExceptionFilter } from '@/common/filters/external-api-exception.filter';
import { LoggingInterceptor } from '@/common/logger/logging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { SwaggerTag } from '@/common/constants';

/**
 * Hàm khởi động ứng dụng (Bootstrap).
 * Thực hiện cấu hình các thành phần hệ thống:
 * 1. Khởi tạo ứng dụng NestJS từ AppModule.
 * 2. Thiết lập ValidationPipe toàn cục để kiểm tra dữ liệu đầu vào.
 * 3. Đăng ký Global Filter (ExternalApiExceptionFilter) để xử lý lỗi API bên ngoài.
 * 4. Đăng ký Global Interceptor (LoggingInterceptor, TransformInterceptor).
 * 5. Cấu hình CORS cho phép truy cập từ mọi nguồn (origin: '*').
 * 6. Cấu hình Swagger để tự động tạo tài liệu API tại đường dẫn /api/docs.
 * 7. Lắng nghe trên cổng được cấu hình trong file môi trường.
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new (await import('@nestjs/common')).ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalFilters(new ExternalApiExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
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
    .addTag(SwaggerTag.PRODUCTS, 'API quản lý sản phẩm khóa cửa')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(config.port);
  logger.log(`Application is running on: http://localhost:${config.port}`);
  logger.log(
    `Swagger document is available at: http://localhost:${config.port}/api/docs`,
  );
}
bootstrap();
