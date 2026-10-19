import { HttpStatus } from '@nestjs/common';

export interface IErrorCodeDefinition {
  errorCode: number;
  errorName: string;
  httpStatus: HttpStatus;
}

export const ErrorCode = {
  // --- AUTH (4xxx) ---
  AUTH_VALIDATION_ERROR: {
    errorCode: 4000,
    errorName: 'AUTH_VALIDATION_ERROR',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  AUTH_INVALID_CREDENTIALS: {
    errorCode: 4001,
    errorName: 'AUTH_INVALID_CREDENTIALS',
    httpStatus: HttpStatus.UNAUTHORIZED,
  },
  AUTH_USER_NOT_FOUND: {
    errorCode: 4002,
    errorName: 'AUTH_USER_NOT_FOUND',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  AUTH_EMAIL_EXISTS: {
    errorCode: 4003,
    errorName: 'AUTH_EMAIL_EXISTS',
    httpStatus: HttpStatus.CONFLICT,
  },
  AUTH_REFRESH_TOKEN_INVALID: {
    errorCode: 4004,
    errorName: 'AUTH_REFRESH_TOKEN_INVALID',
    httpStatus: HttpStatus.UNAUTHORIZED,
  },

  // --- BRANDS & CATEGORIES (5xxx) ---
  BRAND_VALIDATION_ERROR: {
    errorCode: 5000,
    errorName: 'BRAND_VALIDATION_ERROR',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  BRAND_NOT_FOUND: {
    errorCode: 5001,
    errorName: 'BRAND_NOT_FOUND',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  BRAND_ALREADY_EXISTS: {
    errorCode: 5002,
    errorName: 'BRAND_ALREADY_EXISTS',
    httpStatus: HttpStatus.CONFLICT,
  },
  CATEGORY_NOT_FOUND: {
    errorCode: 5003,
    errorName: 'CATEGORY_NOT_FOUND',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  CATEGORY_ALREADY_EXISTS: {
    errorCode: 5004,
    errorName: 'CATEGORY_ALREADY_EXISTS',
    httpStatus: HttpStatus.CONFLICT,
  },
  SUBCATEGORY_NOT_FOUND: {
    errorCode: 5005,
    errorName: 'SUBCATEGORY_NOT_FOUND',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  SUBCATEGORY_ALREADY_EXISTS: {
    errorCode: 5006,
    errorName: 'SUBCATEGORY_ALREADY_EXISTS',
    httpStatus: HttpStatus.CONFLICT,
  },

  // --- PRODUCTS (6xxx) ---
  PRODUCT_VALIDATION_ERROR: {
    errorCode: 6000,
    errorName: 'PRODUCT_VALIDATION_ERROR',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  PRODUCT_NOT_FOUND: {
    errorCode: 6001,
    errorName: 'PRODUCT_NOT_FOUND',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  PRODUCT_ALREADY_EXISTS: {
    errorCode: 6002,
    errorName: 'PRODUCT_ALREADY_EXISTS',
    httpStatus: HttpStatus.CONFLICT,
  },
  PRODUCT_INVALID_PRICE: {
    errorCode: 6003,
    errorName: 'PRODUCT_INVALID_PRICE',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  PRODUCT_INVALID_VARIANTS: {
    errorCode: 6004,
    errorName: 'PRODUCT_INVALID_VARIANTS',
    httpStatus: HttpStatus.BAD_REQUEST,
  },

  // --- UPLOAD / MEDIA (7xxx) ---
  MEDIA_VALIDATION_ERROR: {
    errorCode: 7000,
    errorName: 'MEDIA_VALIDATION_ERROR',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  MEDIA_NOT_FOUND: {
    errorCode: 7001,
    errorName: 'MEDIA_NOT_FOUND',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  INVALID_FILE_TYPE: {
    errorCode: 7002,
    errorName: 'INVALID_FILE_TYPE',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
} as const;

export type ErrorCodeKey = keyof typeof ErrorCode;
