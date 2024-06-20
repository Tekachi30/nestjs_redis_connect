import { Injectable, ArgumentMetadata, BadRequestException, ValidationPipe, ValidationError } from '@nestjs/common';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
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
