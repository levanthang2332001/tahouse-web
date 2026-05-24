export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504],
};

/**
 * Định nghĩa các đường dẫn endpoint API tập trung (RESTful API route)
 */
export enum ApiRoute {
  PRODUCTS_LOCKS = 'products/locks',
  PRODUCTS_LOCKS_DETAIL = 'products/locks/:idOrCode',
  PRODUCTS_LOCKS_INSTALLATION = 'products/locks/:idOrCode/installation',
}

/**
 * Định nghĩa các thẻ (tags) phân loại tài liệu Swagger tập trung
 */
export enum SwaggerTag {
  PRODUCTS = 'products',
}
