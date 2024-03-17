import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "@src/module/user/user.module";
import { VideoModule } from "@src/module/video/video/video.module";
import {
  VideoFavorite,
  VideoRelationFavorite,
} from "@src/module/video/video-favorite/entity";
import { VideoFavoriteController } from "@src/module/video/video-favorite/video-favorite.controller";
import { VideoFavoriteService } from "@src/module/video/video-favorite/video-favorite.service";

/**
 * 视频收藏模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([VideoFavorite, VideoRelationFavorite]),
    UserModule,
    forwardRef(() => VideoModule),
  ],
  controllers: [VideoFavoriteController],
  providers: [VideoFavoriteService],
  exports: [VideoFavoriteService],
})
export class VideoFavoriteModule {}
