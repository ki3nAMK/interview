import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import Redis from 'ioredis';

@Injectable()
export class CacheDomain {
  logger = new Logger(CacheDomain.name);

  private redisClients: Redis;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    const configs = this.configService.get('redis');

    const { host, port, database, password } = configs;

    this.redisClients = new Redis({ host, port, db: database, password });

    this.redisClients.on('connect', () =>
      this.logger.log('Connected to Redis'),
    );
    this.redisClients.on('error', (err) =>
      this.logger.error('Redis Error:', err),
    );
  }

  getRedisClient() {
    return this.redisClients;
  }

  getCacheManager() {
    return this.cacheManager;
  }

  async createEmptySet(key: string) {
    await this.getRedisClient().sadd(key, '1');
    await this.getRedisClient().srem(key, '1');
  }
}
