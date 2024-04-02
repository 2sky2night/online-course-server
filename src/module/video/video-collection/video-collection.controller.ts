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
} from "@src/common/decorator";
import { AccountGuard, RoleGuard } from "@src/common/guard";
import { BooleanPipe, IntPipe, LimitPipe, OffsetPipe } from "@src/common/pipe";
import { Roles } from "@src/module/account/module/role/enum";
import {
  AddTagsDto,
  AddVideosDto,
  CreateVideoCollectionDto,
  DeleteVideosDto,
  RemoveTagsDto,
  UpdateCollectionPartitionDto,
  UpdateVideoCollectionDto,
} from "@src/module/video/video-collection/dto";
import { VideoCollectionService } from "@src/module/video/video-collection/video-collection.service";
import { ResponseDto } from "@src/types/docs";
import { CollectionDtoA } from "@src/types/docs/video/collection";
import { R_VideoListItemDto } from "@src/types/docs/video/video";
import { bodyOptionCatcher } from "@src/utils/tools";

@ApiTags("VideoCollection")
@ApiBearerAuth() // 标明此控制器的所有接口需要Bearer类型的token验证
@ApiExtraModels(ResponseDto)
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
  @ApiOperation({
    summary: "创建一个视频合集",
    description: "老师创建一个视频合集",
  })
  @ApiResponseEmpty()
  @Post()
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
  @ApiOperation({
    summary: "在合集中添加视频",
    description: "老师在视频合集中添加视频",
  })
  @ApiResponseEmpty()
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
  @ApiOperation({
    summary: "在合集中移除视频",
    description: "老师在视频合集中移除视频",
  })
  @ApiResponseEmpty()
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
  @ApiOperation({
    summary: "更新视频合集的信息",
    description: "老师更新视频合集的信息",
  })
  @ApiResponseEmpty()
  @Patch(":cid")
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  updateInfo(
    @AccountToken("sub") accountId: number,
    @Param("cid", new IntPipe("cid")) collectionId: number,
    @Body() videosDto: UpdateVideoCollectionDto,
  ) {
    // 校验请求体
    bodyOptionCatcher(videosDto, [
      "collection_name",
      "description",
      "collection_cover",
    ]);
    return this.VCService.updateInfo(
      accountId,
      collectionId,
      videosDto.collection_name,
      videosDto.description,
      videosDto.collection_cover,
    );
  }

  /**
   * 获取合集信息
   * @param collectionId 合集id
   */
  @ApiOperation({
    summary: "获取合集信息",
    description: "获取合集信息",
  })
  @ApiResponse(CollectionDtoA)
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
  @ApiOperation({
    summary: "查询合集列表",
    description: "分页查询所有视频合集列表",
  })
  @ApiResponsePage(CollectionDtoA)
  @Get("/list")
  list(
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.VCService.list(offset, limit, desc);
  }

  /**
   * 更新合集的分区
   * @param collection_id 合集id
   * @param account_id 账户id
   * @param dto 分区的id
   */
  @ApiOperation({
    summary: "更新合集的分区",
    description: "老师更新合集的分区",
  })
  @ApiResponseEmpty()
  @Patch(":cid/partition")
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  updatePartition(
    @Param("cid", new IntPipe("cid")) collection_id: number,
    @AccountToken("sub") account_id: number,
    @Body() dto: UpdateCollectionPartitionDto,
  ) {
    return this.VCService.updatePartition(
      account_id,
      collection_id,
      dto.partition_id,
    );
  }

  /**
   * 获取此分区下的视频合集
   * @param partition_id 分区id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否根据视频创建时间降序
   */
  @ApiOperation({
    summary: "查询此分区下的合集列表",
    description: "分页查询此分区下的视频合集列表",
  })
  @ApiResponsePage(CollectionDtoA)
  @Get("/list/partition/:pid")
  partitionList(
    @Param("pid", new IntPipe("pid")) partition_id: number,
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.VCService.partitionList(partition_id, offset, limit, desc);
  }

  /**
   * 给合集添加标签
   * @param collection_id 合集id
   * @param tag_id_list 标签id列表
   * @param account_id 账户id
   */
  @ApiOperation({
    summary: "给合集添加标签",
    description: "老师给合集添加标签",
  })
  @ApiResponseEmpty()
  @Post(":cid/tags")
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  addTags(
    @Param("cid", new IntPipe("cid")) collection_id: number,
    @Body() { tag_id_list }: AddTagsDto,
    @AccountToken("sub") account_id: number,
  ) {
    return this.VCService.addTags(account_id, collection_id, tag_id_list);
  }

  /**
   * 移除合集的标签
   * @param collection_id 合集id
   * @param tag_id_list 标签id列表
   * @param account_id 账户id
   */
  @ApiOperation({
    summary: "移除合集的标签",
    description: "老师移除合集的标签",
  })
  @ApiResponseEmpty()
  @Delete(":cid/tags")
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  removeTags(
    @Param("cid", new IntPipe("cid")) collection_id: number,
    @Body() { tag_id_list }: RemoveTagsDto,
    @AccountToken("sub") account_id: number,
  ) {
    return this.VCService.removeTags(account_id, collection_id, tag_id_list);
  }

  /**
   * 获取此合集下的视频列表
   * @param collection_id
   * @param offset
   * @param limit
   * @param desc
   */
  @ApiOperation({
    summary: "获取此合集下的视频列表",
    description: "获取此合集下的视频列表",
  })
  @ApiResponsePage(R_VideoListItemDto)
  @Get(":cid/videos")
  videoList(
    @Param("cid", new IntPipe("cid")) collection_id: number,
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.VCService.videoList(collection_id, offset, limit, desc);
  }
}
