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
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import {
  ApiResponseEmpty,
  ApiResponsePage,
  UserToken,
} from "@src/common/decorator";
import { UserGuard } from "@src/common/guard";
import { BooleanPipe, IntPipe, LimitPipe, OffsetPipe } from "@src/common/pipe";
import { CreateReplyDto } from "@src/module/video/video-reply/dto";
import { VideoReplyService } from "@src/module/video/video-reply/video-reply.service";
import { ResponseDto } from "@src/types/docs";
import { ReplyDtoA } from "@src/types/docs/video/reply";

@ApiTags("VideoReply")
@ApiBearerAuth() // 标明此控制器的所有接口需要Bearer类型的token验证
@ApiExtraModels(ResponseDto)
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
  @ApiOperation({
    summary: "发布回复",
    description: "前台用户发布回复",
  })
  @ApiResponseEmpty()
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
  @ApiOperation({
    summary: "点赞回复",
    description: "前台用户点赞回复",
  })
  @ApiResponseEmpty()
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
  @ApiOperation({
    summary: "取消点赞回复",
    description: "前台用户取消点赞回复",
  })
  @ApiResponseEmpty()
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
  @ApiOperation({
    summary: "查询评论的回复列表",
    description: "分页查询评论的所有回复列表",
  })
  @ApiResponsePage(ReplyDtoA)
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

  /**
   * 查询所有回复
   * @param offset
   * @param limit
   * @param desc
   */
  @ApiOperation({
    summary: "查询所有回复",
    description: "查询所有回复",
  })
  @ApiResponsePage(ReplyDtoA)
  @Get("/reply/list")
  commonList(
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.service.commonList(offset, limit, desc);
  }

  /**
   * 查询某个视频下的所有回复
   * @param video_id
   * @param offset
   * @param limit
   * @param desc
   */
  @ApiOperation({
    summary: "查询某个视频下的所有回复",
    description: "查询某个视频下的所有回复",
  })
  @ApiResponsePage(ReplyDtoA)
  @Get(":vid/reply/list")
  replyListInVideo(
    @Param("vid", new IntPipe("vid")) video_id: number,
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.service.replyListInVideo(video_id, offset, limit, desc);
  }
}
