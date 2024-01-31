import { forwardRef, Module } from "@nestjs/common";
import { VideoController } from "@src/module/video/video/video.controller";
import { VideoService } from "@src/module/video/video/video.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Video } from "@src/module/video/video/entity";
import { UploadVideoModule } from "@src/module/upload/module/video/upload-video.module";
import { AccountModule } from "@src/module/account/account.module";
import { FileModule } from "@src/module/file/file.module";
import { VideoCollectionModule } from "@src/module/video/video-collection/video-collection.module";
import { VideoProvider } from "@src/module/video/video/video.provider";

/**
 * 视频模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Video]),
    UploadVideoModule,
    AccountModule,
    FileModule,
    forwardRef(() => VideoCollectionModule),
  ],
  providers: [VideoService, ...VideoProvider],
  controllers: [VideoController],
  exports: [VideoService],
})
export class VideoModule {}
