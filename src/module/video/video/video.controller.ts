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
import { VideoService } from "@src/module/video/video/video.service";
import {
  AccountToken,
  Role,
  UserOptionToken,
  UserToken,
} from "@src/common/decorator";
import { Roles } from "@src/module/account/module/role/enum";
import {
  AccountGuard,
  RoleGuard,
  UserGuard,
  UserOptionalGuard,
} from "@src/common/guard";
import {
  AddVideoHistoryDto,
  AddVideoTagsDto,
  PublishVideoDto,
  RemoveVideoTagsDto,
  UpdateVideoDto,
  UpdateVideoPartitionDto,
} from "@src/module/video/video/dto";
import { bodyOptionCatcher } from "@src/utils/tools";
import { BooleanPipe, IntPipe, LimitPipe, OffsetPipe } from "@src/common/pipe";

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
   * 增加视频实时观看人数
   * @param video_id 视频id
   * @param user_id 用户id
   */
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
  @Get(":vid/watch")
  videoWatchCount(@Param("vid", new IntPipe("vid")) video_id: number) {
    return this.videoService.videoWatchCount(video_id);
  }

  /**
   * 查询当前用户对视频的态度
   * @param video_id 视频id
   * @param user_id 用户id
   */
  @Get(":vid/status")
  @UseGuards(UserGuard)
  getVideoStatus(
    @Param("vid", new IntPipe("vid")) video_id: number,
    @UserToken("sub") user_id: number,
  ) {
    return this.videoService.getVideoStatus(video_id, user_id);
  }
}
