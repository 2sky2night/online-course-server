import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "@src/module/user/user.module";
import { VideoModule } from "@src/module/video/video/video.module";
import { VideoDanmu } from "@src/module/video/video-danmu/entity";
import { VideoDanmuController } from "@src/module/video/video-danmu/video-danmu.controller";
import { VideoDanmuService } from "@src/module/video/video-danmu/video-danmu.service";

/**
 * 视频弹幕模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([VideoDanmu]), UserModule, VideoModule],
  controllers: [VideoDanmuController],
  providers: [VideoDanmuService],
})
export class VideoDanmuModule {}
