import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { logger } from './winston.logger';

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'secret',
  'newpassword',
  'oldpassword',
  'cookie',
  'set-cookie',
  'x-api-key',
  'client_secret',
]);

/**
 * Đệ quy che dữ liệu nhạy cảm ở mọi tầng lồng nhau của Object và Array
 */
export function deepRedact(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepRedact);

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = deepRedact(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Interceptor ghi log cho các yêu cầu HTTP đến hệ thống.
 * Tự động ghi lại Method, URL, mã phản hồi (Status Code), thời gian xử lý (Duration),
 * cùng với dữ liệu Headers, Body, Query và Response data đã được deep redact an toàn.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, headers } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const statusCode = request?.res?.statusCode;

        logger.info(`[${method}]: [${statusCode}] - [${duration}ms]: ${url}`);

        if (headers && Object.keys(headers).length > 0) {
          logger.info(`[Headers]: ${JSON.stringify(deepRedact(headers))}`);
        }

        if (body && Object.keys(body).length > 0) {
          logger.info(`[Body]: ${JSON.stringify(deepRedact(body))}`);
        }

        if (query && Object.keys(query).length > 0) {
          logger.info(`[Query]: ${JSON.stringify(deepRedact(query))}`);
        }

        if (data) {
          logger.info(`[Response]: ${JSON.stringify(deepRedact(data))}`);
        }
      }),
    );
  }
}
