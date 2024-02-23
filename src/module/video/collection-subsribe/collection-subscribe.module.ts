import { Module } from "@nestjs/common";
import { UserModule } from "@src/module/user/user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollectionSubscribe } from "@src/module/video/collection-subsribe/entity";
import { CollectionSubscribeController } from "@src/module/video/collection-subsribe/collection-subscribe.controller";
import { CollectionSubscribeService } from "@src/module/video/collection-subsribe/collection-subscribe.service";
import { VideoCollectionModule } from "@src/module/video/video-collection/video-collection.module";

/**
 * 用户订阅视频合集模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([CollectionSubscribe]),
    UserModule,
    VideoCollectionModule,
  ],
  controllers: [CollectionSubscribeController],
  providers: [CollectionSubscribeService],
})
export class CollectionSubscribeModule {}