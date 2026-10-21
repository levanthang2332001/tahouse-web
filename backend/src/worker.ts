import type { D1Database } from '@cloudflare/workers-types';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { handleAsNodeRequest } from 'cloudflare:node';
import express from 'express';
import { createServer } from 'node:http';
import 'reflect-metadata';
import { WorkerAppModule, setSwaggerDocument } from './app-worker.module';
import { SwaggerTag } from './common/constants';
import { validationExceptionFactory } from './common/exceptions';
import { GlobalExceptionFilter } from './common/filters';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/logger/logging.interceptor';

export interface Env {
  DB: D1Database;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
  R2_PUBLIC_URL?: string;
  NODE_ENV?: string;
}

const PORT = 8080;
let initPromise: Promise<void> | null = null;

function syncEnv(env: any): void {
  if (!env) return;
  for (const key in env) {
    try {
      const val = env[key];
      if (typeof val === 'string' && val.length > 0) {
        process.env[key] = val;
      }
    } catch {}
  }
  const knownKeys = [
    'LLM_API_KEY',
    'LLM_API_BASE_URL',
    'LLM_MODEL_NAME',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'JWT_ACCESS_EXPIRES_IN',
    'JWT_REFRESH_EXPIRES_IN',
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
    'R2_PUBLIC_URL',
    'IMAGE_BASE_URL',
    'ZALO_PHONE_NUMBER',
    'ZALO_LINK',
    'NODE_ENV',
  ];
  for (const k of knownKeys) {
    if (typeof env[k] === 'string' && env[k].length > 0) {
      process.env[k] = env[k];
    }
  }
}

async function initApp(env: Env): Promise<void> {
  syncEnv(env);

  const expressInstance = express();
  const adapter = new ExpressAdapter(expressInstance);

  const app = await NestFactory.create(
    WorkerAppModule.forWorker(env.DB),
    adapter,
    { logger: ['error', 'warn', 'log'] },
  );

  const reflector = app.get(Reflector);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );
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

  await app.init();

  // Cấu hình Swagger API Docs trên Worker
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
  setSwaggerDocument(document);

  const httpServer = createServer(expressInstance);
  await new Promise<void>((resolve) => httpServer.listen(PORT, resolve));
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const startWall = performance.now();
    syncEnv(env);

    if (!initPromise) {
      const initStart = performance.now();
      initPromise = initApp(env);
      await initPromise;
      const initDuration = (performance.now() - initStart).toFixed(2);
      console.log(
        `[Worker Cold Start] NestJS initialized in ${initDuration} ms`,
      );
    } else {
      await initPromise;
    }

    const response = await handleAsNodeRequest(PORT, request);

    const endWall = performance.now();
    const wallDuration = (endWall - startWall).toFixed(2);

    console.log(
      `[Worker Metrics] [${request.method}] ${request.url} -> Status: ${response.status} | Execution Time: ${wallDuration} ms`,
    );

    // Clone response để gắn thêm benchmark và security headers
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-Execution-Time-Ms', wallDuration);
    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('X-Frame-Options', 'SAMEORIGIN');
    newHeaders.set('X-XSS-Protection', '1; mode=block');
    newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
