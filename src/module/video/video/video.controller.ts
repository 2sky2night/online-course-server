import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { VideoService } from "@src/module/video/video/video.service";
import { AccountToken, Role } from "@src/common/decorator";
import { Roles } from "@src/module/account/module/role/enum";
import { AccountGuard, RoleGuard } from "@src/common/guard";
import { PublishVideoDto, UpdateVideoDto } from "@src/module/video/video/dto";
import { bodyOptionCatcher } from "@src/utils/tools";
import { IntPipe, LimitPipe, OffsetPipe } from "@src/common/pipe";

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
    bodyOptionCatcher(videoDto, ["video_name", "description"]);
    return this.videoService.updateInfo(
      accountId,
      videoId,
      videoDto.video_name,
      videoDto.description,
    );
  }

  /**
   * 查询视频信息
   * @param videoId 视频id
   */
  @Get(":vid")
  info(@Param("vid", new IntPipe("vid")) videoId: number) {
    return this.videoService.info(videoId);
  }

  /**
   * 查询视频列表
   * @param offset 偏移量
   * @param limit 长度
   */
  @Get()
  list(
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
  ) {
    return this.videoService.list(offset, limit);
  }
}
