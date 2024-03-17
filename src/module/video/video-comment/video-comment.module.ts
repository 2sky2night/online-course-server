import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "@src/module/user/user.module";
import { VideoModule } from "@src/module/video/video/video.module";
import {
  VideoComment,
  VideoCommentLike,
} from "@src/module/video/video-comment/entity";
import { VideoCommentController } from "@src/module/video/video-comment/video-comment.controller";
import { VideoCommentService } from "@src/module/video/video-comment/video-comment.service";

/**
 * 视频评论模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([VideoComment, VideoCommentLike]),
    VideoModule,
    UserModule,
  ],
  controllers: [VideoCommentController],
  providers: [VideoCommentService],
  exports: [VideoCommentService],
})
export class VideoCommentModule {}
