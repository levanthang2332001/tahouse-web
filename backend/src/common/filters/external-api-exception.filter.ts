import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { logger } from '@/common/logger/winston.logger';

/**
 * Lớp Filter dùng để bắt và xử lý tập trung các lỗi ngoại lệ (exceptions) xảy ra khi gọi các API bên ngoài (External API) từ hệ thống.
 * Nó giúp chuẩn hóa định dạng dữ liệu lỗi trả về cho client, ẩn đi các chi tiết nhạy cảm và ghi log để dễ dàng theo dõi.
 */
@Catch()
export class ExternalApiExceptionFilter implements ExceptionFilter {
  /**
   * Hàm này tự động được NestJS gọi khi có một exception bị văng ra trong phạm vi áp dụng của Filter này.
   * Chức năng chính:
   * 1. Lấy ra đối tượng response của HTTP từ ngữ cảnh hiện tại.
   * 2. Thiết lập trạng thái lỗi mặc định là 502 (Bad Gateway).
   * 3. Phân tích đối tượng `exception` (đặc biệt là lỗi từ Axios):
   *    - Nếu là lỗi Axios có response: Lấy http status và message chi tiết từ server bên thứ 3 trả về.
   *    - Nếu là lỗi Timeout: Chuyển http status thành 504 (Gateway Timeout).
   *    - Nếu là lỗi không kết nối được (ECONNREFUSED): Đổi message thành 'External API unavailable'.
   * 4. Ghi log chi tiết lỗi thông qua Winston logger.
   * 5. Định dạng lại cấu trúc lỗi chuẩn và trả về cho client.
   *
   * @param exception Đối tượng lỗi (exception) bị văng ra trong quá trình gọi External API.
   * @param host Cung cấp các phương thức để lấy thông tin về context hiện tại (ví dụ lấy request, response object).
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let message = 'External API error';
    let status = HttpStatus.BAD_GATEWAY;
    let detail: any = null;

    if (exception instanceof Error) {
      const axiosError = exception as any;
      if (axiosError.isAxiosError && axiosError.response) {
        status = axiosError.response.status;
        detail = axiosError.response.data;
        message =
          detail?.detail?.message ||
          detail?.message ||
          detail?.detail ||
          exception.message;
      } else if (exception.message.includes('timeout')) {
        message = 'External API timeout';
        status = HttpStatus.GATEWAY_TIMEOUT;
      } else if (exception.message.includes('ECONNREFUSED')) {
        message = 'External API unavailable';
      } else {
        message = exception.message;
      }
    }

    logger.error(`[External API] ${status} - ${message}`, { detail });

    response.status(status).json({
      statusCode: status,
      message,
      error: 'External API Error',
      detail,
    });
  }
}
