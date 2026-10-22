import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { BusinessException } from './business.exception';
import { IErrorCodeDefinition } from '../constants/error-codes';
import { DEFAULT_ERROR_CODE_KEY } from '../decorators/default-error-code.decorator';

interface ErrorCodeMatch {
  errorDef: IErrorCodeDefinition;
  field: string;
  message: string;
  value: unknown;
}

/**
 * Tìm lỗi validate đầu tiên có gắn errorCode qua context của decorator
 * (ví dụ IsLessThanOrEqualField(..., { context: { errorCode: ErrorCode.X } })).
 * Ưu tiên cao nhất vì đây là rule nghiệp vụ cụ thể, không phải lỗi cấu trúc chung.
 */
function findFieldErrorCodeMatch(
  errors: ValidationError[],
): ErrorCodeMatch | null {
  for (const error of errors) {
    if (error.contexts) {
      for (const context of Object.values(error.contexts)) {
        if (context?.errorCode) {
          const constraintMessages = Object.values(error.constraints || {});
          return {
            errorDef: context.errorCode,
            field: error.property,
            message: constraintMessages[0] || 'Validation failed',
            value: error.value,
          };
        }
      }
    }

    if (error.children?.length) {
      const nested = findFieldErrorCodeMatch(error.children);
      if (nested) return nested;
    }
  }
  return null;
}

/**
 * Tìm lỗi lá đầu tiên thực sự có constraint fail (bỏ qua node cha chỉ chứa children).
 * Dùng làm nguồn field/message/value khi fallback về namespace mặc định của DTO.
 */
function findFirstLeafError(errors: ValidationError[]): ValidationError | null {
  for (const error of errors) {
    if (error.constraints && Object.keys(error.constraints).length > 0) {
      return error;
    }
    if (error.children?.length) {
      const nested = findFirstLeafError(error.children);
      if (nested) return nested;
    }
  }
  return null;
}

/**
 * Đọc errorCode namespace mặc định gắn trên class DTO qua @DefaultErrorCode
 * (error.target ở mỗi cấp nested chính là instance DTO ở cấp đó, nên tự đúng
 * namespace kể cả với DTO lồng nhau).
 */
function findNamespaceFallback(
  error: ValidationError,
): IErrorCodeDefinition | null {
  const ctor = error.target?.constructor;
  if (!ctor) return null;
  return Reflect.getMetadata(DEFAULT_ERROR_CODE_KEY, ctor) || null;
}

/**
 * exceptionFactory cho ValidationPipe toàn cục — mọi lỗi 400 (kể cả @IsString,
 * @IsNotEmpty cơ bản) đều trả về cùng 1 pattern { code, errorName, message, data.field }
 * để client luôn bắt được theo 1 chuẩn duy nhất, không riêng gì rule nghiệp vụ custom.
 *
 * Thứ tự ưu tiên:
 * 1. Field có context.errorCode riêng (rule nghiệp vụ cụ thể, vd PRODUCT_INVALID_PRICE).
 * 2. Namespace mặc định của DTO qua @DefaultErrorCode (vd AUTH_VALIDATION_ERROR = 4000).
 * 3. DTO không gắn @DefaultErrorCode -> giữ nguyên 400 mặc định của NestJS.
 */
export function validationExceptionFactory(errors: ValidationError[]) {
  const fieldMatch = findFieldErrorCodeMatch(errors);
  if (fieldMatch) {
    return new BusinessException(
      fieldMatch.errorDef,
      fieldMatch.message,
      fieldMatch.field,
      { value: fieldMatch.value },
    );
  }

  const leafError = findFirstLeafError(errors);
  if (leafError) {
    const namespaceFallback = findNamespaceFallback(leafError);
    if (namespaceFallback) {
      const message =
        Object.values(leafError.constraints || {})[0] || 'Validation failed';
      return new BusinessException(
        namespaceFallback,
        message,
        leafError.property,
        { value: leafError.value },
      );
    }
  }

  const messages = errors.flatMap((error) =>
    Object.values(error.constraints || {}),
  );
  return new BadRequestException(messages);
}
