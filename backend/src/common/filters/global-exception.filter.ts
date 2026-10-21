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
 * Global Exception Filter standardizes all error responses to match the API format.
 * HTTP status (400/401/403/404/409/500...) is only set on the response status line
 * (response.status(status)) — it is NOT duplicated in the JSON body. The body's "code"
 * is the business error code (falls back to the HTTP status number when the exception
 * has no business error code, e.g. generic validation errors).
 * "message" is for developers/logs only — clients must render localized text from
 * "errorName" + "data.params", never by parsing "message".
 * {
 *   "success": false,
 *   "code": 6003,
 *   "errorName": "PRODUCT_INVALID_PRICE",
 *   "message": "price (999999) must not exceed originalPrice (500000)",
 *   "data": {
 *     "field": "price",
 *     "params": { "price": 999999, "originalPrice": 500000 }
 *   }
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
    let errorCode: number | undefined = undefined;
    let errorName: string | undefined = undefined;
    let field: string | undefined = undefined;
    let params: Record<string, unknown> | undefined = undefined;
    let detail: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as any;
        if (Array.isArray(resObj.message)) {
          message = resObj.message;
        } else {
          message = resObj.message || exception.message;
        }
        if (resObj.errorCode) {
          errorCode = resObj.errorCode;
        }
        if (resObj.errorName) {
          errorName = resObj.errorName;
        }
        if (resObj.field) {
          field = resObj.field;
        }
        if (resObj.params) {
          params = resObj.params;
        }
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
      } else if (exception.message?.includes('timeout')) {
        message = 'Gateway timeout';
        status = HttpStatus.GATEWAY_TIMEOUT;
      } else if (exception.message?.includes('ECONNREFUSED')) {
        message = 'Service unavailable';
        status = HttpStatus.SERVICE_UNAVAILABLE;
      } else {
        message = exception.message || 'Internal server error';
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

    // Trên Production: Không để lộ raw error message của DB hay detail ra ngoài client
    const isProd = process.env.NODE_ENV === 'production';
    const clientMessage =
      isProd && status >= HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Đã xảy ra lỗi nội bộ hệ thống, vui lòng thử lại sau.'
        : message;

    const hasStructuredData = field !== undefined || params !== undefined;
    const errorBody: Record<string, any> = {
      success: false,
      code: errorCode ?? status,
      message: clientMessage,
      data: hasStructuredData
        ? {
            ...(field !== undefined ? { field } : {}),
            ...(params !== undefined ? { params } : {}),
          }
        : null,
    };

    if (errorName !== undefined) {
      errorBody.errorName = errorName;
    }

    if (detail !== undefined && !isProd) {
      errorBody.detail = detail;
    }

    response.status(status).json(errorBody);
  }
}
