import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BYPASS_TRANSFORM_KEY } from '../decorators/bypass-transform.decorator';

export interface ResponseFormat<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ResponseFormat<T> | T
> {
  constructor(private readonly reflector?: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isBypass = this.reflector?.getAllAndOverride<boolean>(
      BYPASS_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isBypass) {
      return next.handle();
    }

    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode || 200;

    return next.handle().pipe(
      map((data) => {
        // Nếu dữ liệu trả về đã được bọc đúng định dạng trước đó, giữ nguyên
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'code' in data &&
          'message' in data &&
          'data' in data
        ) {
          return data;
        }

        return {
          success: true,
          code: statusCode,
          message: 'success',
          data: data,
        };
      }),
    );
  }
}
