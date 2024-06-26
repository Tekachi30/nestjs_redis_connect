import { Module, forwardRef } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'src/redis/redis.module';
import { Post } from './entities/post.entity';
import { UsersModule } from 'src/users/users.module';
import { ImgPostModule } from 'src/img_post/img_post.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    forwardRef(() => UsersModule),
    forwardRef(() => ImgPostModule),
    RedisModule
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService]
})
export class PostsModule {}
