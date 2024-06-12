import { Injectable } from '@nestjs/common';
import IORedis, { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new IORedis({
      host: process.env.REDIS_CONNECTION,
      port: 6379,
      password: process.env.REDIS_PASSWORD,
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