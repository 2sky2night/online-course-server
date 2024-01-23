import { Inject, Injectable } from "@nestjs/common";
import { RedisClientType } from "redis";

@Injectable()
export class RedisService {
  @Inject("REDIS_CLIENT")
  private redisClient: RedisClientType;

  /**
   * 添加会过期的键值对
   * @param key 键
   * @param value 值
   * @param ttl 存活时间
   */
  setEx(key: string, value: string, ttl: number) {
    return this.redisClient.setEx(key, ttl, value);
  }

  /**
   * 添加一个键值对
   * @param key 键
   * @param value 值
   */
  set(key: string, value: string) {
    return this.redisClient.set(key, value);
  }

  /**
   * 读取键值对
   * @param key 键
   */
  get(key: string) {
    return this.redisClient.get(key);
  }

  /**
   * 读取并删除一个键
   * @param key 键
   */
  getDel(key: string) {
    return this.redisClient.getDel(key);
  }

  /**
   * 删除一个键
   * @param key 删除的键
   */
  del(key: string) {
    return this.redisClient.del(key);
  }
}
