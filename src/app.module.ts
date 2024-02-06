import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmConfigService } from "@src/config/database";
import { AccountModule } from "@src/module/account/account.module";
import { AuthUserModule } from "@src/module/auth/user/auth-user.module";
import { AuthAccountModule } from "@src/module/auth/account/auth-account.module";
import { UserModule } from "@src/module/user/user.module";
import { RedisModule } from "@src/module/redis/redis.module";
import { UploadModule } from "@src/module/upload/upload.module";
import OAuthConfig from "src/config/oauth";
import { UploadConfig } from "@src/config/upload";
import { RoleModule } from "@src/module/account/module/role/role.module";
import { VideoModule } from "@src/module/video/video/video.module";
import { VideoCollectionModule } from "@src/module/video/video-collection/video-collection.module";
import { FileModule } from "@src/module/file/file.module";
import { VideoCommentModule } from "@src/module/video/video-comment/video-comment.module";
import { VideoReplyModule } from "@src/module/video/video-reply/video-reply.module";
import { VideoPartitionModule } from "@src/module/video/video-partition/video-partition.module";
import { VideoTagModule } from "@src/module/video/video-tag/video-tag.module";

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
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    RedisModule,
    UploadModule,
    AccountModule,
    AuthUserModule,
    AuthAccountModule,
    UserModule,
    RoleModule,
    VideoModule,
    FileModule,
    VideoCollectionModule,
    VideoCommentModule,
    VideoReplyModule,
    VideoPartitionModule,
    VideoTagModule,
  ],
})
export class AppModule {}
