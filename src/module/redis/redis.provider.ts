import { createClient } from "redis";
import { Logger, Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export const redisProvider: Provider[] = [
  {
    inject: [ConfigService],
    provide: "REDIS_CLIENT",
    useFactory(configService: ConfigService) {
      // 连接1号数据库
      return createClient({
        database: Number(configService.get("REDIS_DATABASE_NAME")),
      })
        .on("error", (err) => Logger.error("Redis Client Error", err))
        .connect();
    },
  },
];
