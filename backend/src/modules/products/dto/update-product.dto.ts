import { PartialType } from '@nestjs/swagger';
import { DefaultErrorCode } from '@/common/decorators';
import { ErrorCode } from '@/common/constants';
import { CreateProductDto } from './create-product.dto';

/**
 * Every field is optional, but `null` is only accepted where the create DTO allows it
 * (e.g. `originalPrice: null` clears the original price, `price: null` means "Liên hệ").
 * Required fields such as `name`, `code`, `brandId` and `category` reject `null`
 * instead of letting it reach a NOT NULL column.
 * (PartialType does not extend CreateProductDto, so the error-code namespace is declared again.)
 */
@DefaultErrorCode(ErrorCode.PRODUCT_VALIDATION_ERROR)
export class UpdateProductDto extends PartialType(CreateProductDto, {
  skipNullProperties: false,
}) {}
