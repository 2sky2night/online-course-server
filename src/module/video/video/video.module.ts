import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountModule } from "@src/module/account/account.module";
import { FileModule } from "@src/module/file/file.module";
import { UploadVideoModule } from "@src/module/upload/module/video/upload-video.module";
import { UserModule } from "@src/module/user/user.module";
import {
  Video,
  VideoHistory,
  VideoLike,
  VideoView,
} from "@src/module/video/video/entity";
import { VideoController } from "@src/module/video/video/video.controller";
import { VideoProvider } from "@src/module/video/video/video.provider";
import { VideoService } from "@src/module/video/video/video.service";
import { VideoCollectionModule } from "@src/module/video/video-collection/video-collection.module";
import { VideoFavoriteModule } from "@src/module/video/video-favorite/video-favorite.module";
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
    forwardRef(() => VideoFavoriteModule),
  ],
  providers: [VideoService, ...VideoProvider],
  controllers: [VideoController],
  exports: [VideoService],
})
export class VideoModule {}
