import { forwardRef, Module } from "@nestjs/common";
import { AccountModule } from "@src/module/account/account.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VideoCollection } from "@src/module/video/video-collection/entity";
import { VideoCollectionService } from "@src/module/video/video-collection/video-collection.service";
import { VideoCollectionController } from "@src/module/video/video-collection/video-collection.controller";
import { VideoModule } from "@src/module/video/video/video.module";

/**
 * 视频合集模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([VideoCollection]),
    AccountModule,
    forwardRef(() => VideoModule),
  ],
  providers: [VideoCollectionService],
  controllers: [VideoCollectionController],
  exports: [VideoCollectionService],
})
export class VideoCollectionModule {}
