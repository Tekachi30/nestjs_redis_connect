import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomValidationPipe } from './assist/pipe/custom-validation.pipe';

async function bootstrap() {
  // Tạo một ứng dụng HTTP
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new CustomValidationPipe(), new ValidationPipe);
  await app.listen(3000);

}
bootstrap();
