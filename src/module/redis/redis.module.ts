import { Global, Module } from "@nestjs/common";
import { redisProvider } from "@src/module/redis/redis.provider";
import { RedisService } from "@src/module/redis/redis.service";

/**
 * redis全局模块
 */
@Global()
@Module({
  providers: [...redisProvider, RedisService],
  exports: [RedisService],
})
export class RedisModule {}
