import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JsonDbService {
  private readonly logger = new Logger(JsonDbService.name);
  private cache: Record<string, any> = {};

  /**
   * Đọc file JSON và thiết lập watcher. Trả về một hàm getter để luôn lấy được dữ liệu mới nhất.
   * @param fileName Tên file trong thư mục database (ví dụ: 'products.json')
   * @param defaultValue Giá trị mặc định nếu file chưa tồn tại (ví dụ: [] hoặc {})
   * @returns Hàm getter () => T
   */
  public register<T>(fileName: string, defaultValue: T): () => T {
    const dbPath = path.resolve(process.cwd(), 'database', fileName);
    this.cache[fileName] = defaultValue;

    const loadData = () => {
      try {
        if (!fs.existsSync(dbPath)) {
          this.cache[fileName] = defaultValue;
          return;
        }
        const rawData = fs.readFileSync(dbPath, 'utf8');
        this.cache[fileName] = JSON.parse(rawData);
      } catch (error) {
        this.logger.error(`Lỗi đọc file ${fileName}: ${error.message}`);
      }
    };

    // Đọc lần đầu
    loadData();

    // Thiết lập watcher
    if (fs.existsSync(dbPath)) {
      fs.watch(dbPath, (eventType) => {
        if (eventType === 'change') {
          try {
            loadData();
          } catch (error) {
            // Bỏ qua lỗi parse JSON khi file đang ghi dở dang
            this.logger.error(
              `Lỗi parse JSON khi reload ${fileName}: ${error.message}`,
            );
          }
        }
      });
    }

    // Trả về getter function
    return () => this.cache[fileName] as T;
  }
}
