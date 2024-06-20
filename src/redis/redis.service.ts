//redis.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis, { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  //khai báo
  private client: Redis;
  
  // cấu hình 
  constructor(private configService: ConfigService) {
    this.client = new IORedis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 1),
    });
  }

  //lấy dữ liệu
  async get(key: string): Promise<string> {
    // lấy từng key
    try {
      return await this.client.get(key);
    } catch (error) {
      console.log(error);
    }
  }

  //thêm key
  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    // ttl => time to live (dùng để settime hết hạn)
    if (ttl) {
      return (await this.client.set(key, value, 'EX', ttl)) === 'OK';
    }
    return (await this.client.set(key, value)) === 'OK';
  }

  //xóa 1 key
  async del(key: string): Promise<number> {
    // xóa 1
    return await this.client.del(key);
  }

  //xóa hết key
  async flushall(): Promise<string> {
    // dùng để xóa hết
    return await this.client.flushall();
  }

  //lấy hết key
  async getAllKeys(keyPattern: string = '*'): Promise<string[]> {
    const keys = await this.client.keys(keyPattern);
    return keys;
  }
}
