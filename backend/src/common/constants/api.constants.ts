export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504],
};

/**
 * Định nghĩa tập trung tất cả các đường dẫn endpoint API (RESTful API route)
 */
export enum ApiRoute {
  // --- Public APIs (Không cần Auth) ---
  PRODUCTS_LOCKS = 'products/locks',
  PRODUCTS_LOCKS_DETAIL = 'products/locks/:code',
  PRODUCTS_LOCKS_INSTALLATION = 'products/locks/:code/installation',
  BRANDS = 'brands',

  // --- Auth APIs ---
  AUTH_LOGIN = 'auth/login',
  AUTH_REFRESH = 'auth/refresh',
  AUTH_LOGOUT = 'auth/logout',
  AUTH_LOGOUT_ALL = 'auth/logout-all',
  AUTH_ME = 'auth/me',
  AUTH_CHANGE_PASSWORD = 'auth/change-password',

  // --- Admin APIs (Bắt buộc Header: Authorization Bearer Token) ---
  ADMIN_PRODUCTS = 'admin/products',
  ADMIN_PRODUCTS_DETAIL = 'admin/products/:id',
  ADMIN_BRANDS = 'admin/brands',
  ADMIN_BRANDS_DETAIL = 'admin/brands/:idOrSlug',
  ADMIN_BRANDS_CATEGORIES = 'admin/brands/:idOrSlug/categories',
  ADMIN_BRANDS_CATEGORY_DETAIL = 'admin/brands/:idOrSlug/categories/:categorySlug',
  ADMIN_BRANDS_SUBCATEGORIES = 'admin/brands/:idOrSlug/categories/:categorySlug/subcategories',
  ADMIN_BRANDS_SUBCATEGORY_DETAIL = 'admin/brands/:idOrSlug/categories/:categorySlug/subcategories/:subcategorySlug',

  // --- Upload & Media Management APIs ---
  ADMIN_UPLOAD = 'admin/upload',
  ADMIN_UPLOAD_DETAIL = 'admin/upload/:id',
}

/**
 * Định nghĩa các thẻ (tags) phân loại tài liệu Swagger tập trung
 */
export enum SwaggerTag {
  PRODUCTS = 'products',
  BRANDS = 'brands',
  AUTH = 'Auth & Quản trị viên',
  ADMIN_PRODUCTS = 'Admin - Quản lý Sản phẩm',
  ADMIN_BRANDS = 'Admin - Quản lý Thương hiệu',
  ADMIN_UPLOAD = 'Admin - Quản lý Tải lên File (Media)',
}
