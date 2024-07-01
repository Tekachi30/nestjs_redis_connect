import { Module, forwardRef } from '@nestjs/common';
import { ImgPostService } from './img_post.service';
import { ImgPostController } from './img_post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImgPost } from './entities/img_post.entity';
import { v2 as cloudinary } from 'cloudinary';
import { RedisModule } from 'src/redis/redis.module';
import { PostsModule } from 'src/posts/posts.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImgPost]),
    forwardRef(() => PostsModule),
    forwardRef(() => UsersModule),
    RedisModule,
  ],
  controllers: [ImgPostController],
  providers: [
    ImgPostService,
    {
      provide: 'CLOUDINARY',
      useFactory: () =>
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        }),
    },
  ],
  exports: [ImgPostService],
})
export class ImgPostModule {}
