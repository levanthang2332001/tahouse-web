import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ResponseFormat<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
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
