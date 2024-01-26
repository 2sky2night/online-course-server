import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmConfigService } from "@src/config/database";
import { AccountModule } from "@src/module/account/account.module";
import { AuthModule } from "@src/module/auth/auth.module";
import { UserModule } from "@src/module/user/user.module";
import { RedisModule } from "@src/module/redis/redis.module";
import { UploadModule } from "@src/module/upload/upload.module";
import OAuthConfig from "src/config/oauth";
import { UploadConfig } from "@src/config/upload";
import { RoleModule } from "@src/module/account/module/role/role.module";
import { VideoModule } from "@src/module/video/video.module";

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
      load: [...OAuthConfig, UploadConfig],
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
     * 文件上传模块
     */
    UploadModule,
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
    /**
     * 角色模块
     */
    RoleModule,
    /**
     * 视频模块
     */
    VideoModule,
  ],
})
export class AppModule {}
