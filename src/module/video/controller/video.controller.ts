import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { VideoService } from "@src/module/video/service";
import { CreateVideoDto } from "@src/module/video/dto";
import { AccountGuard, RoleGuard } from "@src/common/guard";
import { AccountToken, Role } from "@src/common/decorator";
import { Roles } from "@src/module/account/module/role/enum";

@Controller("/video")
export class VideoController {
  /**
   * 视频服务层
   */
  @Inject(VideoService)
  videoService: VideoService;

  /**
   * 老师上传视频
   * @param accountId 发布者
   * @param createVideoDto 表单
   */
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  @Post()
  createVideo(
    @AccountToken("sub") accountId: number,
    @Body() createVideoDto: CreateVideoDto,
  ) {
    return this.videoService.createVideo(accountId, createVideoDto);
  }
}
