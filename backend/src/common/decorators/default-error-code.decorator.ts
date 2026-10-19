import { IErrorCodeDefinition } from '../constants/error-codes';

export const DEFAULT_ERROR_CODE_KEY = Symbol('DEFAULT_ERROR_CODE');

/**
 * Gắn errorCode namespace mặc định cho 1 DTO — dùng làm fallback khi field
 * lỗi validate không có context.errorCode riêng (vd @IsString, @IsNotEmpty cơ bản).
 * DTO con dùng PartialType(DTO cha) tự kế thừa metadata này qua prototype chain,
 * không cần khai báo lại.
 */
export function DefaultErrorCode(
  errorDef: IErrorCodeDefinition,
): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(DEFAULT_ERROR_CODE_KEY, errorDef, target);
  };
}
