import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  VideoCollectionRelationTag,
  VideoRelationTag,
  VideoTag,
} from "@src/module/video/video-tag/entity";
import { VideoTagService } from "@src/module/video/video-tag/video-tag.service";
import { VideoTagController } from "@src/module/video/video-tag/video-tag.controller";
import { AccountModule } from "@src/module/account/account.module";

/**
 * 视频标签模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      VideoTag,
      VideoRelationTag,
      VideoCollectionRelationTag,
    ]),
    AccountModule,
  ],
  controllers: [VideoTagController],
  providers: [VideoTagService],
  exports: [VideoTagService],
})
export class VideoTagModule {}
