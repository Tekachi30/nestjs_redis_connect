import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomValidationPipe } from './assist/pipe/custom-validation.pipe';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  // Tạo một ứng dụng HTTP
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new CustomValidationPipe());
  await app.listen(3000);

  // // Tạo một ứng dụng microservice
  // const microserviceApp  = await NestFactory.createMicroservice(AppModule, {
  //   transport: Transport.TCP,
  //   options: {
  //     host: '0.0.0.0',
  //     port: 4000, // Sử dụng một cổng khác cho microservice
  //   },
  // });
  // microserviceApp.useGlobalPipes(new ValidationPipe(),  new CustomValidationPipe());
  // await microserviceApp.listen();
}
bootstrap();
