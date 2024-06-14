//redis.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis, { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  //khai báo
  private client: Redis;

  constructor(private configService: ConfigService) {
    // cấu hình
    this.client = new IORedis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 1),
    });
  }

  async get(key: string): Promise<string> {
    // lấy từng key
    try {
      return await this.client.get(key);
    } catch (error) {
      console.log(error);
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    // ttl => time to live (dùng để settime hết hạn)
    if (ttl) {
      return (await this.client.set(key, value, 'EX', ttl)) === 'OK';
    }
    return (await this.client.set(key, value)) === 'OK';
  }

  async del(key: string): Promise<number> {
    // xóa 1
    return await this.client.del(key);
  }

  async flushall(): Promise<string> {
    // dùng để xóa hết
    return await this.client.flushall();
  }

  async getAllKeys(pattern: string = '*'): Promise<string[]> {
    //lấy tất cả key
    return await this.client.keys(pattern);
  }

  // cách khác tìm toàn bộ: (khuyến khích ?????)
  // async scanKeys(pattern: string = '*'): Promise<string[]> {
  //   const keys: string[] = [];
  //   let cursor = '0';
  //   do {
  //     const reply = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
  //     console.log(reply);
  //     cursor = reply[0];
  //     keys.push(...reply[1]);
  //   } while (cursor !== '0');
  //   return keys;
  // }
}
