import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomValidationPipe } from './assist/pipe/custom-validation.pipe';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // Tạo một ứng dụng HTTP
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new CustomValidationPipe(), new ValidationPipe);
  await app.listen(3000);

}
bootstrap();
