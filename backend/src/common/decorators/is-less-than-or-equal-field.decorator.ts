import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Validates that the decorated field is less than or equal to another field in the same object.
 * Only triggers when both fields are present and numeric.
 *
 * @example
 * @IsLessThanOrEqualField('originalPrice', {
 *   message: 'price must not exceed originalPrice',
 * })
 * price?: number;
 */
export function IsLessThanOrEqualField(
  relatedField: string,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'IsLessThanOrEqualField',
      target: object.constructor,
      propertyName: String(propertyName),
      constraints: [relatedField],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const [relatedFieldName] = args.constraints as [string];
          const relatedValue = (args.object as Record<string, unknown>)[
            relatedFieldName
          ];

          // Only validate when both values are present numbers
          if (typeof value !== 'number' || typeof relatedValue !== 'number') {
            return true;
          }

          return value <= relatedValue;
        },
        defaultMessage(args: ValidationArguments): string {
          const [relatedFieldName] = args.constraints as [string];
          return `${args.property} must be less than or equal to ${relatedFieldName}`;
        },
      },
    });
  };
}
