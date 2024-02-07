import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  VideoFavorite,
  VideoRelationFavorite,
} from "@src/module/video/video-favorite/entity";
import { UserModule } from "@src/module/user/user.module";
import { VideoFavoriteController } from "@src/module/video/video-favorite/video-favorite.controller";
import { VideoFavoriteService } from "@src/module/video/video-favorite/video-favorite.service";
import { VideoModule } from "@src/module/video/video/video.module";

/**
 * 视频收藏模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([VideoFavorite, VideoRelationFavorite]),
    UserModule,
    VideoModule,
  ],
  controllers: [VideoFavoriteController],
  providers: [VideoFavoriteService],
})
export class VideoFavoriteModule {}
