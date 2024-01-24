import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmConfigService } from "@src/config/database";
import { AccountModule } from "@src/module/account/account.module";
import { AuthModule } from "@src/module/auth/auth.module";
import OAuthConfig from "src/config/oauth";
import { UserModule } from "@src/module/user/user.module";
import { RedisModule } from "@src/module/redis/redis.module";

@Module({
  imports: [
    /**
     * 加载环境变量
     */
    ConfigModule.forRoot({
      envFilePath: [
        ".env",
        process.env.NODE_ENV === "development"
          ? ".env.development"
          : ".env.production",
      ],
      // load中的数据不会加载到env中，只能通过config模块获取
      load: [...OAuthConfig],
      isGlobal: true,
    }),
    /**
     * 建立数据库连接
     */
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    /**
     * redis模块
     */
    RedisModule,
    /**
     * 后台账户模块
     */
    AccountModule,
    /**
     * 鉴权模块
     */
    AuthModule,
    /**
     * 前台用户模块
     */
    UserModule,
  ],
})
export class AppModule {}
