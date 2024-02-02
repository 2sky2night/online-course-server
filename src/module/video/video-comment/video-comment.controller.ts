import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { VideoCommentService } from "@src/module/video/video-comment/video-comment.service";
import { UserGuard } from "@src/common/guard";
import { UserToken } from "@src/common/decorator";
import { AddCommentDto } from "@src/module/video/video-comment/dto";
import { BooleanPipe, IntPipe, LimitPipe, OffsetPipe } from "@src/common/pipe";

/**
 * 评论控制层
 */
@Controller("video")
export class VideoCommentController {
  /**
   * 视频评论服务层
   * @private
   */
  @Inject(VideoCommentService)
  private service: VideoCommentService;

  /**
   * 发送评论
   * @param user_id 用户id
   * @param dto 表单
   */
  @Post("/comment")
  @UseGuards(UserGuard)
  addComment(@UserToken("sub") user_id: number, @Body() dto: AddCommentDto) {
    return this.service.addComment(
      dto.video_id,
      user_id,
      dto.content,
      dto.images,
    );
  }

  /**
   * 查询某个视频下的评论
   * @param video_id 视频id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否按照发布时间降序排序
   */
  @Get(":vid/comment")
  list(
    @Param("vid", new IntPipe("vid")) video_id: number,
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.service.list(video_id, offset, limit, desc);
  }

  /**
   * 点赞评论
   * @param comment_id 评论id
   * @param user_id 用户id
   */
  @Post("/comment/:cid")
  @UseGuards(UserGuard)
  addCommentLike(
    @Param("cid", new IntPipe("cid")) comment_id: number,
    @UserToken("sub") user_id: number,
  ) {
    return this.service.addCommentLike(comment_id, user_id);
  }

  /**
   * 取消点赞评论
   * @param comment_id 评论id
   * @param user_id 用户id
   */
  @Delete("/comment/:cid")
  @UseGuards(UserGuard)
  removeCommentLike(
    @Param("cid", new IntPipe("cid")) comment_id: number,
    @UserToken("sub") user_id: number,
  ) {
    return this.service.removeCommentLike(comment_id, user_id);
  }

  // TODO 回复功能
}
