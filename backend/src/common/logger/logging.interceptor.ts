import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { logger } from './winston.logger';

/**
 * Interceptor ghi log cho các yêu cầu HTTP đến hệ thống.
 * Tự động ghi lại Method, URL, mã phản hồi (Status Code), thời gian xử lý (Duration),
 * cùng với dữ liệu Headers, Body, Query và Response data.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  /**
   * Phương thức chặn (intercept) để xử lý logic ghi log trước và sau khi request được thực thi.
   */
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
        logger.info(`[Headers]: ${JSON.stringify(headers)}`);

        if (body && Object.keys(body).length > 0) {
          logger.info(`[Body]: ${JSON.stringify(body)}`);
        }

        if (query && Object.keys(query).length > 0) {
          logger.info(`[Query]: ${JSON.stringify(query)}`);
        }

        if (data) {
          logger.info(`[Response]: ${JSON.stringify(data)}`);
        }
      }),
    );
  }
}
