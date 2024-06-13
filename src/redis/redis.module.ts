//redis.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Module({
  imports: [ConfigModule],
  providers: [ConfigService, RedisService],
  exports: [RedisService],
})
export class RedisModule {}
