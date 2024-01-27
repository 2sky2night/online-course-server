import {
  Body,
  Controller,
  Delete,
  Inject,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CreateVideoCollectionDto } from "@src/module/video/video-collection/dto";
import { VideoCollectionService } from "@src/module/video/video-collection/video-collection.service";
import { AccountToken, Role } from "@src/common/decorator";
import { Roles } from "@src/module/account/module/role/enum";
import { AccountGuard, RoleGuard } from "@src/common/guard";

@Controller("/video/collection")
export class VideoCollectionController {
  /**
   * 视频合集服务层
   */
  @Inject(VideoCollectionService)
  VCService: VideoCollectionService;

  /**
   * 创建一个合集
   * @param accountId 发布者
   * @param videoCollectionDto 表单
   */
  @Post("")
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  publishCollection(
    @AccountToken("sub") accountId: number,
    @Body() videoCollectionDto: CreateVideoCollectionDto,
  ) {
    return this.VCService.publishCollection(accountId, videoCollectionDto);
  }

  // TODO 在合集中添加视频
  @Post(":cid/videos")
  addVideos() {}

  // TODO 在合集中移除视频
  @Delete(":cid/videos")
  removeVideos() {}

  // TODO 更新视频信息
  @Patch(":collection_id")
  updateInfo() {}
}
