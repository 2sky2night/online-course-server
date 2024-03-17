import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "@src/module/user/user.module";
import { VideoCommentModule } from "@src/module/video/video-comment/video-comment.module";
import {
  VideoReply,
  VideoReplyLike,
} from "@src/module/video/video-reply/entity";
import { VideoReplyController } from "@src/module/video/video-reply/video-reply.controller";
import { VideoReplyService } from "@src/module/video/video-reply/video-reply.service";

/**
 * 视频回复模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([VideoReply, VideoReplyLike]),
    VideoCommentModule,
    UserModule,
  ],
  controllers: [VideoReplyController],
  providers: [VideoReplyService],
})
export class VideoReplyModule {}
