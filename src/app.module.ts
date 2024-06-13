//app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';


@Module({
  imports: [ ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  }),
  RedisModule,
  UsersModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
