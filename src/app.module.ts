import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfigService } from "@src/config/database";
import { UploadConfig } from "@src/config/upload";
import { AccountModule } from "@src/module/account/account.module";
import { RoleModule } from "@src/module/account/module/role/role.module";
import { AuthAccountModule } from "@src/module/auth/account/auth-account.module";
import { AuthUserModule } from "@src/module/auth/user/auth-user.module";
import { FileModule } from "@src/module/file/file.module";
import { MonitorModule } from "@src/module/monitor/monitor.module";
import { RedisModule } from "@src/module/redis/redis.module";
import { UploadModule } from "@src/module/upload/upload.module";
import { UserModule } from "@src/module/user/user.module";
import { CollectionSubscribeModule } from "@src/module/video/collection-subsribe/collection-subscribe.module";
import { VideoModule } from "@src/module/video/video/video.module";
import { VideoCollectionModule } from "@src/module/video/video-collection/video-collection.module";
import { VideoCommentModule } from "@src/module/video/video-comment/video-comment.module";
import { VideoDanmuModule } from "@src/module/video/video-danmu/video-danmu.module";
import { VideoFavoriteModule } from "@src/module/video/video-favorite/video-favorite.module";
import { VideoPartitionModule } from "@src/module/video/video-partition/video-partition.module";
import { VideoReplyModule } from "@src/module/video/video-reply/video-reply.module";
import { VideoTagModule } from "@src/module/video/video-tag/video-tag.module";
import OAuthConfig from "src/config/oauth";

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
    VideoFavoriteModule,
    CollectionSubscribeModule,
    VideoDanmuModule,
    MonitorModule,
  ],
})
export class AppModule {}
