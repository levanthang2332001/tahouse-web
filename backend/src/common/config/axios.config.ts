import axios, { AxiosInstance, AxiosError } from 'axios';

export const DEFAULT_TIMEOUT = 10000;

/**
 * Hàm khởi tạo một instance Axios với cấu hình mặc định cho các yêu cầu tới ElevenLabs.
 * Tự động thêm API Key vào header và cấu hình bộ chặn (interceptor) để ghi log lỗi.
 *
 * @param baseURL URL gốc của API.
 * @param apiKey Khóa xác thực API của ElevenLabs.
 * @param timeout Thời gian tối đa chờ phản hồi (mặc định 10s).
 * @returns Instance của Axios đã được cấu hình.
 */
export const createAxiosInstance = (
  baseURL: string,
  apiKey: string,
  timeout: number = DEFAULT_TIMEOUT,
): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config;
      if (!originalRequest) {
        return Promise.reject(error);
      }

      // Log error for monitoring
      console.error(`[Axios Error] ${error.message}`, {
        url: error.config?.url,
        status: error.response?.status,
      });

      return Promise.reject(error);
    },
  );

  return instance;
};
