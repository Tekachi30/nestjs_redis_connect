import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RedisModule } from 'src/redis/redis.module';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from 'src/posts/posts.module';
import { ImgPostModule } from 'src/img_post/img_post.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => PostsModule),
    forwardRef(() => ImgPostModule),
    RedisModule
    ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
