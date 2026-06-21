import { Injectable, OnModuleDestroy, Optional } from '@nestjs/common';
import { ILogPayload } from './interfaces/log-payload.interface';
import * as logFormatterInterface from './interfaces/log-formatter.interface';
import * as logSenderInterface from './interfaces/log-sender.interface';

/**
 * Service quản lý bộ đệm (buffer) cho log.
 * Thay vì gửi log ngay lập tức, service này sẽ gom log thành từng đợt (batch)
 * để tối ưu hóa hiệu suất gửi log tới các dịch vụ bên ngoài.
 */
@Injectable()
export class LogBufferService implements OnModuleDestroy {
  private logBuffer: ILogPayload[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly batchSize = 10;
  private readonly batchInterval = 5000;

  constructor(
    @Optional()
    private readonly logFormatter?: logFormatterInterface.ILogFormatter,
    @Optional() private readonly logSender?: logSenderInterface.ILogSender,
  ) {
    this.startBatchTimer();
  }

  /**
   * Phương thức được gọi khi module bị hủy (shutdown).
   * Đảm bảo dừng bộ đếm và đẩy nốt tất cả log còn tồn đọng trong buffer đi.
   */
  onModuleDestroy() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    this.flushLogs();
  }

  /**
   * Thêm một bản ghi log mới vào bộ đệm.
   * Nếu số lượng log đạt tới ngưỡng batchSize, tự động thực hiện đẩy log đi.
   * @param logData Dữ liệu log cần thêm.
   */
  addLog(logData: Partial<ILogPayload>): void {
    const formattedLog = this.logFormatter
      ? this.logFormatter.format(logData)
      : (logData as ILogPayload);

    this.logBuffer.push(formattedLog);

    if (this.logBuffer.length >= this.batchSize) {
      this.flushLogs();
    }
  }

  /**
   * Phương thức nội bộ thực hiện đẩy (flush) toàn bộ log hiện có trong buffer.
   * Sử dụng logSender để gửi dữ liệu nếu nó đã sẵn sàng.
   */
  private flushLogs(): void {
    if (this.logBuffer.length === 0) return;

    if (this.logSender && this.logSender.isReady()) {
      const logsToSend = [...this.logBuffer];
      this.logBuffer = [];
      this.logSender.send(logsToSend).catch(console.error);
    } else {
      this.logBuffer = [];
    }
  }

  /**
   * Khởi động bộ đếm thời gian để định kỳ đẩy log đi sau mỗi batchInterval.
   */
  private startBatchTimer(): void {
    this.batchTimer = setInterval(() => {
      this.flushLogs();
    }, this.batchInterval);
  }
}
