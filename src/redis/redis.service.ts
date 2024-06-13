import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis, { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor(private configService: ConfigService) {
    this.client = new IORedis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string): Promise<boolean> {
    return (await this.client.set(key, value)) === 'OK';
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }
}
