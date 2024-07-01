//app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { GradesModule } from './grades/grades.module';
import { CustomTypeOrmModule } from './typeorm.config';
import { PostsModule } from './posts/posts.module';
import { ImgPostModule } from './img_post/img_post.module';


@Module({
  imports: [ ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  }),
  CustomTypeOrmModule,
  RedisModule,
  PostsModule,
  UsersModule,
  GradesModule,
  PostsModule,
  ImgPostModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
