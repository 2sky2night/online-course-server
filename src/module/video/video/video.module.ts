import { forwardRef, Module } from "@nestjs/common";
import { VideoController } from "@src/module/video/video/video.controller";
import { VideoService } from "@src/module/video/video/video.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  Video,
  VideoHistory,
  VideoLike,
  VideoView,
} from "@src/module/video/video/entity";
import { UploadVideoModule } from "@src/module/upload/module/video/upload-video.module";
import { AccountModule } from "@src/module/account/account.module";
import { FileModule } from "@src/module/file/file.module";
import { VideoCollectionModule } from "@src/module/video/video-collection/video-collection.module";
import { VideoProvider } from "@src/module/video/video/video.provider";
import { UserModule } from "@src/module/user/user.module";
import { VideoPartitionModule } from "@src/module/video/video-partition/video-partition.module";
import { VideoTagModule } from "@src/module/video/video-tag/video-tag.module";

/**
 * 视频模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Video, VideoView, VideoHistory, VideoLike]),
    UploadVideoModule,
    AccountModule,
    FileModule,
    forwardRef(() => VideoCollectionModule),
    UserModule,
    VideoPartitionModule,
    VideoTagModule,
  ],
  providers: [VideoService, ...VideoProvider],
  controllers: [VideoController],
  exports: [VideoService],
})
export class VideoModule {}
