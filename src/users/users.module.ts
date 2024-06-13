import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    RedisModule
    ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
