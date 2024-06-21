//validatorCustom.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

// kiểm tra rỗng
export function IsNotBlank(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotBlank',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'string' && value.trim().length > 0;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} không được để trống`;
        },
      },
    });
  };
}
