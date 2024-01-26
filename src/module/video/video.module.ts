import { Module } from "@nestjs/common";
import { UploadVideoModule } from "@src/module/upload/module/video/upload-video.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Video, VideoCollection } from "@src/module/video/entity";
import { VideoService } from "@src/module/video/service";
import { AccountModule } from "@src/module/account/account.module";
import { VideoController } from "@src/module/video/controller";

/**
 * 视频模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Video, VideoCollection]),
    UploadVideoModule,
    AccountModule,
  ],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
