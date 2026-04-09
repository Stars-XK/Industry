import * as dotenv from 'dotenv';
dotenv.config();

import { Module, Global } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [
    NestRedisModule.forRootAsync({
      useFactory: () => {
        const host = process.env.REDIS_HOST || 'localhost';
        const port = process.env.REDIS_PORT || '6379';
        const db = process.env.REDIS_DB || '0';
        
        return {
          type: 'single',
          url: `redis://${host}:${port}/${db}`,
          options: {
            password: process.env.REDIS_PWD || '',
          },
        };
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
