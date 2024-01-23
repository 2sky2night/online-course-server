import { createClient } from "redis";
import { Logger, Provider } from "@nestjs/common";

export const redisProvider: Provider[] = [
  {
    provide: "REDIS_CLIENT",
    useFactory() {
      // 连接1号数据库
      return createClient({ database: 1 })
        .on("error", (err) => Logger.error("Redis Client Error", err))
        .connect();
    },
  },
];
