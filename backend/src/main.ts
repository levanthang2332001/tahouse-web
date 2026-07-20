import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as os from 'os';
import { join } from 'path';
import { AppModule } from './app.module';
import { config } from '@/common/config';
import { ExternalApiExceptionFilter } from '@/common/filters/external-api-exception.filter';
import { LoggingInterceptor } from '@/common/logger/logging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { SwaggerTag } from '@/common/constants';

function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

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

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Ảnh catalogue local (fallback khi R2 public URL 403)
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });

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

  await app.listen(config.port, '0.0.0.0');
  const localIp = getLocalIP();
  logger.log(`Application is running on: http://localhost:${config.port}`);
  logger.log(
    `For testing on phone (same Wi-Fi): http://${localIp}:${config.port}/rag/client`,
  );
  logger.log(
    `Swagger document is available at: http://localhost:${config.port}/api/docs`,
  );
}
bootstrap();
