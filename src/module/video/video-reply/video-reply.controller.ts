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
import { VideoReplyService } from "@src/module/video/video-reply/video-reply.service";
import { UserGuard } from "@src/common/guard";
import { UserToken } from "@src/common/decorator";
import { CreateReplyDto } from "@src/module/video/video-reply/dto";
import { BooleanPipe, IntPipe, LimitPipe, OffsetPipe } from "@src/common/pipe";

@Controller("video")
export class VideoReplyController {
  /**
   * 视频回复服务层
   * @private
   */
  @Inject(VideoReplyService)
  private service: VideoReplyService;

  /**
   * 发布回复
   * @param user_id 用户id
   * @param dto 回复表单
   */
  @Post("/reply")
  @UseGuards(UserGuard)
  addReply(@UserToken("sub") user_id: number, @Body() dto: CreateReplyDto) {
    return this.service.addReply(
      user_id,
      dto.comment_id,
      dto.content,
      dto.images,
      dto.ref_id,
    );
  }

  /**
   * 点赞回复
   * @param user_id 用户id
   * @param reply_id 回复id
   */
  @Post("/reply/:rid")
  @UseGuards(UserGuard)
  addReplyLike(
    @UserToken("sub") user_id: number,
    @Param("rid", new IntPipe("rid")) reply_id: number,
  ) {
    return this.service.addReplyLike(user_id, reply_id);
  }

  /**
   * 取消点赞回复
   * @param user_id 用户id
   * @param reply_id 回复id
   */
  @Delete("/reply/:rid")
  @UseGuards(UserGuard)
  removeReplyLike(
    @UserToken("sub") user_id: number,
    @Param("rid", new IntPipe("rid")) reply_id: number,
  ) {
    return this.service.removeReplyLike(user_id, reply_id);
  }

  /**
   * 查询评论的回复列表
   * @param comment_id 评论id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否按照创建时间降序
   */
  @Get("/comment/:cid/reply")
  list(
    @Param("cid", new IntPipe("cid")) comment_id: number,
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe)
    desc: boolean,
  ) {
    return this.service.list(comment_id, offset, limit, desc);
  }
}
