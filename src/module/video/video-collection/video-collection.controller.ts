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
  AddVideosDto,
  CreateVideoCollectionDto,
  DeleteVideosDto,
  UpdateVideoCollectionDto,
} from "@src/module/video/video-collection/dto";
import { VideoCollectionService } from "@src/module/video/video-collection/video-collection.service";
import { AccountToken, Role } from "@src/common/decorator";
import { Roles } from "@src/module/account/module/role/enum";
import { AccountGuard, RoleGuard } from "@src/common/guard";
import { BooleanPipe, IntPipe, LimitPipe, OffsetPipe } from "@src/common/pipe";
import { bodyOptionCatcher } from "@src/utils/tools";

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

  /**
   * 在合集中添加视频
   * @param accountId 账户id
   * @param collectionId 合集id
   * @param videosDto 视频列表
   */
  @Post(":cid/videos")
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  addVideos(
    @AccountToken("sub") accountId: number,
    @Param("cid", new IntPipe("cid")) collectionId: number,
    @Body() videosDto: AddVideosDto,
  ) {
    return this.VCService.addVideos(
      accountId,
      videosDto.video_id_list,
      collectionId,
    );
  }

  /**
   * 在合集中移除视频
   * @param accountId 账户id
   * @param collectionId 合集id
   * @param videosDto 视频列表
   */
  @Delete(":cid/videos")
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  removeVideos(
    @AccountToken("sub") accountId: number,
    @Param("cid", new IntPipe("cid")) collectionId: number,
    @Body() videosDto: DeleteVideosDto,
  ) {
    return this.VCService.deleteVideos(
      accountId,
      videosDto.video_id_list,
      collectionId,
    );
  }

  /**
   * 更新视频合集的信息
   * @param accountId 账户id
   * @param collectionId 合集id
   * @param videosDto 表单
   */
  @Patch(":cid")
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  updateInfo(
    @AccountToken("sub") accountId: number,
    @Param("cid", new IntPipe("cid")) collectionId: number,
    @Body() videosDto: UpdateVideoCollectionDto,
  ) {
    // 校验请求体
    bodyOptionCatcher(videosDto, ["collection_name", "description"]);
    return this.VCService.updateInfo(
      accountId,
      collectionId,
      videosDto.collection_name,
      videosDto.description,
    );
  }

  /**
   * 获取合集信息
   * @param collectionId 合集id
   */
  @Get("/info/:cid")
  info(@Param("cid", new IntPipe("cid")) collectionId: number) {
    return this.VCService.info(collectionId);
  }

  /**
   * 合集列表
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否按照创建时间降序
   */
  @Get("/list")
  list(
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.VCService.list(offset, limit, desc);
  }
}
