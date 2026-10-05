import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { logger } from '@/common/logger/winston.logger';

/**
 * Global Exception Filter standardizes all error responses to match the API format:
 * {
 *   "success": false,
 *   "code": 401,
 *   "message": "No auth token",
 *   "data": null,
 *   "error": "Unauthorized"
 * }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';
    let detail: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        error = exception.name.replace(/Exception$/, '');
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as any;
        if (Array.isArray(resObj.message)) {
          message = resObj.message;
        } else {
          message = resObj.message || exception.message;
        }
        error = resObj.error || exception.name.replace(/Exception$/, '');
        if (resObj.detail) {
          detail = resObj.detail;
        }
      }
    } else if (exception instanceof Error) {
      const axiosError = exception as any;
      if (axiosError.isAxiosError && axiosError.response) {
        status = axiosError.response.status || HttpStatus.BAD_GATEWAY;
        detail = axiosError.response.data;
        message =
          detail?.message ||
          detail?.detail ||
          axiosError.message ||
          'External service error';
        error = 'Bad Gateway';
      } else if (exception.message?.includes('timeout')) {
        message = 'Gateway timeout';
        status = HttpStatus.GATEWAY_TIMEOUT;
        error = 'Gateway Timeout';
      } else if (exception.message?.includes('ECONNREFUSED')) {
        message = 'Service unavailable';
        status = HttpStatus.SERVICE_UNAVAILABLE;
        error = 'Service Unavailable';
      } else {
        message = exception.message || 'Internal server error';
        error = 'Internal Server Error';
      }
    }

    // Client errors (4xx) are logged cleanly without stack traces
    // Server errors (5xx) are logged with full stack traces
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      logger.error(
        `[${request.method}] ${request.url} - ${status} - ${JSON.stringify(message)}`,
        { detail, stack: (exception as any)?.stack },
      );
    } else {
      logger.warn(
        `[${request.method}] ${request.url} - ${status} - ${JSON.stringify(message)}`,
      );
    }

    const errorBody: Record<string, any> = {
      success: false,
      code: status,
      message,
      data: null,
      error,
    };

    if (detail !== undefined) {
      errorBody.detail = detail;
    }

    response.status(status).json(errorBody);
  }
}
