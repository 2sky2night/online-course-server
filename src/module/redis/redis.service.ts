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

  /**
   * 获取一个键，若存在，则转换成数字
   * @param key 查询的键
   */
  async getNumber(key: string) {
    const value = await this.get(key);
    if (value === null) return null;
    return Number(value);
  }

  /**
   * 增加一个列表类型的键
   * @param key 键
   * @param value 值
   */
  setList(key: string, value: string) {
    return this.redisClient.lPush(key, value);
  }

  /**
   * 某个键是否存在？
   * @param key 键
   */
  exists(key: string) {
    return this.redisClient.exists(key);
  }

  /**
   * 给集合添加元素
   * @param key 键
   * @param value 值
   */
  sAdd(key: string, value: string) {
    return this.redisClient.sAdd(key, value);
  }

  /**
   * 集合是否存在某个元素
   * @param key 键
   * @param value 值
   */
  sIsMember(key: string, value: string) {
    return this.redisClient.sIsMember(key, value);
  }

  /**
   * 从集合中移除一个成员
   * @param key 键
   * @param value 值
   */
  sRem(key: string, value: string) {
    return this.redisClient.sRem(key, value);
  }

  /**
   * 查询合集的元素数量
   * @param key 键
   */
  sCard(key: string) {
    return this.redisClient.sCard(key);
  }
}
