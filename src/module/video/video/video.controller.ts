import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
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
  AccountToken,
  ApiResponse,
  ApiResponseEmpty,
  ApiResponsePage,
  Role,
  UserOptionToken,
  UserToken,
} from "@src/common/decorator";
import {
  AccountGuard,
  RoleGuard,
  UserGuard,
  UserOptionalGuard,
} from "@src/common/guard";
import { BooleanPipe, IntPipe, LimitPipe, OffsetPipe } from "@src/common/pipe";
import { Roles } from "@src/module/account/module/role/enum";
import {
  AddVideoHistoryDto,
  AddVideoTagsDto,
  PublishVideoDto,
  RemoveVideoTagsDto,
  UpdateVideoDto,
  UpdateVideoPartitionDto,
} from "@src/module/video/video/dto";
import { VideoService } from "@src/module/video/video/video.service";
import { ResponseDto } from "@src/types/docs";
import {
  R_VideoInfoDto,
  R_VideoListItemDto,
  R_VideoViewsCount,
  R_VideoWatchCount,
} from "@src/types/docs/video/video";
import { bodyOptionCatcher } from "@src/utils/tools";

@ApiTags("Video")
@ApiBearerAuth() // 标明此控制器的所有接口需要Bearer类型的token验证
@ApiExtraModels(ResponseDto)
@Controller("/video")
export class VideoController {
  /**
   * 视频服务层
   */
  @Inject(VideoService)
  videoService: VideoService;

  /**
   * 老师发布视频
   * @param accountId 发布者
   * @param publishVideoDto 表单
   */
  @ApiOperation({
    summary: "老师发布视频",
    description: "老师发布视频",
  })
  @ApiResponseEmpty()
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  @Post()
  publishVideo(
    @AccountToken("sub") accountId: number,
    @Body() publishVideoDto: PublishVideoDto,
  ) {
    return this.videoService.publishVideo(accountId, publishVideoDto);
  }

  /**
   * 更新视频信息
   * @param accountId 账户id
   * @param videoId 视频id
   * @param videoDto 表单
   */
  @ApiOperation({
    summary: "更新视频信息",
    description: "老师更新视频的信息",
  })
  @ApiResponseEmpty()
  @Patch(":vid")
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  updateInfo(
    @AccountToken("sub") accountId: number,
    @Param("vid", new IntPipe("vid")) videoId: number,
    @Body() videoDto: UpdateVideoDto,
  ) {
    bodyOptionCatcher(videoDto, ["video_name", "description", "video_cover"]);
    return this.videoService.updateInfo(
      accountId,
      videoId,
      videoDto.video_name,
      videoDto.description,
      videoDto.video_cover,
    );
  }

  /**
   * 查询视频信息
   * @param videoId 视频id
   */
  @ApiOperation({
    summary: "查询视频的详情信息",
    description: "查询视频的详情信息",
  })
  @ApiResponse(R_VideoInfoDto)
  @Get("/info/:vid")
  info(@Param("vid", new IntPipe("vid")) videoId: number) {
    return this.videoService.info(videoId);
  }

  /**
   * 查询视频列表
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否按照时间降序
   */
  @ApiOperation({
    summary: "分页查询视频",
    description: "分页查询视频",
  })
  @ApiResponsePage(R_VideoListItemDto)
  @Get("/list")
  list(
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.videoService.list(offset, limit, desc);
  }

  /**
   * 增加视频浏览量
   * @param video_id 视频id
   * @param user_id 用户id
   */
  @ApiOperation({
    summary: "增加视频浏览量",
    description: "增加视频浏览量",
  })
  @ApiResponseEmpty()
  @Post(":vid/views")
  @UseGuards(UserOptionalGuard)
  addViews(
    @Param("vid", new IntPipe("vid")) video_id: number,
    @UserOptionToken("sub") user_id: number | undefined,
  ) {
    return this.videoService.addViews(video_id, user_id);
  }

  /**
   * 获取视频浏览量
   * @param video_id 视频id
   */
  @ApiOperation({
    summary: "获取视频浏览量",
    description: "获取视频浏览量",
  })
  @ApiResponse(R_VideoViewsCount)
  @Get(":vid/views")
  viewsCount(@Param("vid", new IntPipe("vid")) video_id: number) {
    return this.videoService.viewsCount(video_id);
  }

  /**
   * 增加视频浏览历史记录
   * @param video_id 视频id
   * @param user_id 用户id
   * @param dto 浏览时长
   */
  @ApiOperation({
    summary: "增加视频浏览历史记录",
    description: "前台用户增加视频浏览历史记录,并记录用户观看的时长",
  })
  @ApiResponseEmpty()
  @Post(":vid/history")
  @UseGuards(UserGuard)
  addHistory(
    @Param("vid", new IntPipe("vid")) video_id: number,
    @UserToken("sub") user_id: number,
    @Body() { viewing_time }: AddVideoHistoryDto,
  ) {
    return this.videoService.addHistory(video_id, user_id, viewing_time);
  }

  /**
   * 点赞视频
   * @param video_id 视频id
   * @param user_id 用户id
   */
  @ApiOperation({
    summary: "点赞视频",
    description: "前台用户给视频点赞",
  })
  @ApiResponseEmpty()
  @Post(":vid/like")
  @UseGuards(UserGuard)
  addLike(
    @Param("vid", new IntPipe("vid")) video_id: number,
    @UserToken("sub") user_id: number,
  ) {
    return this.videoService.addLike(video_id, user_id);
  }

  /**
   * 取消点赞
   * @param video_id 视频号
   * @param user_id 用户id
   */
  @ApiOperation({
    summary: "取消点赞视频",
    description: "前台用户取消点赞点赞",
  })
  @ApiResponseEmpty()
  @Delete(":vid/like")
  @UseGuards(UserGuard)
  removeLike(
    @Param("vid", new IntPipe("vid")) video_id: number,
    @UserToken("sub") user_id: number,
  ) {
    return this.videoService.removeLike(video_id, user_id);
  }

  /**
   * 删除视频历史记录
   * @param video_id 视频id
   * @param user_id 用户id
   */
  @ApiOperation({
    summary: "删除视频观看记录",
    description: "前台用户删除视频观看记录",
  })
  @ApiResponseEmpty()
  @Delete(":vid/history")
  @UseGuards(UserGuard)
  removeHistory(
    @Param("vid", new IntPipe("vid")) video_id: number,
    @UserToken("sub") user_id: number,
  ) {
    return this.videoService.removeHistory(video_id, user_id);
  }

  /**
   * 更新视频的分区
   * @param video_id 视频id
   * @param account_id 账户id
   * @param dto 分区信息
   */
  @ApiOperation({
    summary: "修改视频分区",
    description: "老师修改视频分区",
  })
  @ApiResponseEmpty()
  @Patch(":vid/partition")
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  updateVideoPartition(
    @Param("vid", new IntPipe("vid")) video_id: number,
    @AccountToken("sub") account_id: number,
    @Body() dto: UpdateVideoPartitionDto,
  ) {
    return this.videoService.updateVideoPartition(
      account_id,
      video_id,
      dto.partition_id,
    );
  }

  /**
   * 获取此分区下的视频
   * @param partition_id 分区id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否根据视频创建时间降序
   */
  @ApiOperation({
    summary: "查询某分区下的视频",
    description: "查询某分区下的视频",
  })
  @ApiResponsePage(R_VideoListItemDto)
  @Get("/list/partition/:pid")
  partitionList(
    @Param("pid", new IntPipe("pid")) partition_id: number,
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.videoService.partitionList(partition_id, offset, limit, desc);
  }

  /**
   * 给视频添加标签
   * @param video_id 视频id
   * @param account_id 账户id
   * @param tag_id_list 标签id列表
   */
  @ApiOperation({
    summary: "给视频添加标签",
    description: "老师给视频添加标签",
  })
  @ApiResponseEmpty()
  @Post(":vid/tags")
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  addVideoTags(
    @Param("vid", new IntPipe("vid")) video_id: number,
    @AccountToken("sub") account_id: number,
    @Body() { tag_id_list }: AddVideoTagsDto,
  ) {
    return this.videoService.addVideoTags(account_id, video_id, tag_id_list);
  }

  /**
   * 移除视频标签
   * @param video_id 视频id
   * @param account_id 账户id
   * @param tag_id_list 标签id列表
   */
  @ApiOperation({
    summary: "删除视频的一些标签",
    description: "老师给视频移除一些标签",
  })
  @ApiResponseEmpty()
  @Delete(":vid/tags")
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  removeVideoTags(
    @Param("vid", new IntPipe("vid")) video_id: number,
    @AccountToken("sub") account_id: number,
    @Body() { tag_id_list }: RemoveVideoTagsDto,
  ) {
    return this.videoService.removeVideoTags(account_id, video_id, tag_id_list);
  }

  /**
   * TODO 是否需要换个实现思路，标识浏览器指纹，将指纹来标识唯一用户
   * 增加视频实时观看人数
   * @param video_id 视频id
   * @param user_id 用户id
   */
  @ApiOperation({
    summary: "增加视频实时观看人数",
    description: "前台用户增加视频实时观看人数",
  })
  @ApiResponseEmpty()
  @Post(":vid/watch")
  @UseGuards(UserGuard)
  watchVideo(
    @Param("vid", new IntPipe("vid")) video_id: number,
    @UserToken("sub") user_id: number,
  ) {
    return this.videoService.incWatchVideo(video_id, user_id);
  }

  /**
   * 移除视频实时观看人数
   * @param video_id 视频id
   * @param user_id 用户id
   */
  @ApiOperation({
    summary: "移除视频实时观看人数",
    description: "前台用户移除视频实时观看人数",
  })
  @ApiResponseEmpty()
  @Delete(":vid/watch")
  @UseGuards(UserGuard)
  decWatchVideo(
    @Param("vid", new IntPipe("vid")) video_id: number,
    @UserToken("sub") user_id: number,
  ) {
    return this.videoService.decWatchVideo(video_id, user_id);
  }

  /**
   * 查询视频观看实时人数
   * @param video_id 视频id
   */
  @ApiOperation({
    summary: "查询视频观看实时人数",
    description: "查询视频观看实时人数",
  })
  @ApiResponse(R_VideoWatchCount)
  @Get(":vid/watch")
  videoWatchCount(@Param("vid", new IntPipe("vid")) video_id: number) {
    return this.videoService.videoWatchCount(video_id);
  }

  /**
   * 查询当前用户对视频的态度
   * @param video_id 视频id
   * @param user_id 用户id
   */
  @ApiOperation({
    summary: "查询当前用户对视频的态度(点赞、收藏状态)",
    description: "查询当前用户对视频的态度(点赞、收藏状态)",
  })
  @ApiResponse(R_VideoWatchCount)
  @Get(":vid/status")
  @UseGuards(UserGuard)
  getVideoStatus(
    @Param("vid", new IntPipe("vid")) video_id: number,
    @UserToken("sub") user_id: number,
  ) {
    return this.videoService.getVideoStatus(video_id, user_id);
  }

  @ApiOperation({
    summary: "查询某个老师发布的视频",
    description: "查询某个老师发布的视频",
  })
  @ApiResponsePage(R_VideoListItemDto)
  @Get("/list/teacher")
  getTeacherVideoList(
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
    @Query("tid", new IntPipe("tid")) account_id: number,
  ) {
    return this.videoService.getTeacherVideoList(
      account_id,
      offset,
      limit,
      desc,
    );
  }
}
