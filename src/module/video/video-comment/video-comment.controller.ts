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
import { AddCommentDto } from "@src/module/video/video-comment/dto";
import { VideoCommentService } from "@src/module/video/video-comment/video-comment.service";
import { ResponseDto } from "@src/types/docs";
import { CommentDtoA } from "@src/types/docs/video/comment";

/**
 * 评论控制层
 */
@ApiTags("VideoComment")
@ApiBearerAuth() // 标明此控制器的所有接口需要Bearer类型的token验证
@ApiExtraModels(ResponseDto)
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
  @ApiOperation({
    summary: "发送评论",
    description: "前台用户发送视频评论",
  })
  @ApiResponseEmpty()
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
  @ApiOperation({
    summary: "查询视频评论列表",
    description: "分页查询视频评论列表",
  })
  @ApiResponsePage(CommentDtoA)
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
  @ApiOperation({
    summary: "点赞评论",
    description: "前台用户点赞评论",
  })
  @ApiResponseEmpty()
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
  @ApiOperation({
    summary: "取消点赞评论",
    description: "前台用户取消点赞评论",
  })
  @ApiResponseEmpty()
  @Delete("/comment/:cid")
  @UseGuards(UserGuard)
  removeCommentLike(
    @Param("cid", new IntPipe("cid")) comment_id: number,
    @UserToken("sub") user_id: number,
  ) {
    return this.service.removeCommentLike(comment_id, user_id);
  }

  /**
   * 查询所有评论
   * @param offset
   * @param limit
   * @param desc
   */
  @ApiOperation({
    summary: "查询所有评论",
    description: "分页查询所有评论",
  })
  @ApiResponsePage(CommentDtoA)
  @Get("/comment/list")
  commonList(
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.service.commentList(offset, limit, desc);
  }
}
