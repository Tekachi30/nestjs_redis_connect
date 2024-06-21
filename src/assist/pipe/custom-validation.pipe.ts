import { Injectable, ArgumentMetadata, BadRequestException, ValidationPipe, ValidationError } from '@nestjs/common';

@Injectable()
export class CustomValidationPipe extends ValidationPipe { // dùng để xóa [] trong message có sẵn
  constructor() {
    super({
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.map(
          (error) => 
            Object.values(error.constraints ?? {}).join(', ')
        );
        return new BadRequestException(messages.join(', '));
      },
    });
  }
}
