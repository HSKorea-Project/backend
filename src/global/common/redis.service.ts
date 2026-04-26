import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor() {
    if (!process.env.REDIS_URL) throw new Error('REDIS_URL 환경변수 없음');
    this.client = new Redis(process.env.REDIS_URL);
  }

  async set(key: string, value: string, ttl?: number) {
    if (ttl) return this.client.set(key, value, 'EX', ttl);
    return this.client.set(key, value);
  }

  async get(key: string) { return this.client.get(key); }
  async del(key: string) { return this.client.del(key); }
  async onModuleDestroy() { await this.client.quit(); }
}