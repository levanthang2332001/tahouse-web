/**
 * Logger tối ưu cho Cloudflare Workers & Node.js
 * Sử dụng console native để tránh lỗi "The _write() method is not implemented"
 * của process.stdout trong môi trường V8 Isolate.
 */
export const logger = {
  info: (message: string, ...meta: any[]) => {
    const metaStr = meta.length ? ' ' + JSON.stringify(meta) : '';
    console.log(`[${new Date().toISOString()}] [INFO] ${message}${metaStr}`);
  },
  warn: (message: string, ...meta: any[]) => {
    const metaStr = meta.length ? ' ' + JSON.stringify(meta) : '';
    console.warn(`[${new Date().toISOString()}] [WARN] ${message}${metaStr}`);
  },
  error: (message: string, ...meta: any[]) => {
    const metaStr = meta.length ? ' ' + JSON.stringify(meta) : '';
    console.error(`[${new Date().toISOString()}] [ERROR] ${message}${metaStr}`);
  },
  debug: (message: string, ...meta: any[]) => {
    const metaStr = meta.length ? ' ' + JSON.stringify(meta) : '';
    console.debug(`[${new Date().toISOString()}] [DEBUG] ${message}${metaStr}`);
  },
};
