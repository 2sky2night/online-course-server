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
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import {
  AccountToken,
  ApiResponseEmpty,
  ApiResponsePage,
  Role,
} from "@src/common/decorator";
import { AccountGuard, RoleGuard } from "@src/common/guard";
import { BooleanPipe, IntPipe, LimitPipe, OffsetPipe } from "@src/common/pipe";
import { Roles } from "@src/module/account/module/role/enum";
import { CreateTagDto, UpdateTagDto } from "@src/module/video/video-tag/dto";
import { VideoTagService } from "@src/module/video/video-tag/video-tag.service";
import { ResponseDto } from "@src/types/docs";
import { CollectionDtoA } from "@src/types/docs/video/collection";
import { TagInfoDto } from "@src/types/docs/video/tag";
import { R_VideoListItemDto } from "@src/types/docs/video/video";

/**
 * 视频标签控制层
 */
@ApiTags("VideoTag")
@ApiBearerAuth() // 标明此控制器的所有接口需要Bearer类型的token验证
@ApiExtraModels(ResponseDto)
@Controller("video/tag")
export class VideoTagController {
  /**
   * 视频标签服务层
   * @private
   */
  @Inject(VideoTagService)
  private service: VideoTagService;

  /**
   * 创建标签
   * @param account_id 账户id
   * @param dto 表单
   */
  @ApiOperation({
    summary: "创建标签",
    description: "后台账户创建标签",
  })
  @ApiResponseEmpty()
  @Post()
  @Role(Roles.SUPER_ADMIN, Roles.ADMIN)
  @UseGuards(AccountGuard, RoleGuard)
  addTag(@AccountToken("sub") account_id: number, @Body() dto: CreateTagDto) {
    return this.service.addTag(dto.tag_name, account_id);
  }

  /**
   * 更新标签
   * @param account_id 账户id
   * @param dto 表单
   * @param tag_id 标签id
   */
  @ApiOperation({
    summary: "更新标签",
    description: "后台账户更新标签",
  })
  @ApiResponseEmpty()
  @Patch(":tid")
  @Role(Roles.SUPER_ADMIN, Roles.ADMIN)
  @UseGuards(AccountGuard, RoleGuard)
  updateTag(
    @AccountToken("sub") account_id: number,
    @Body() dto: UpdateTagDto,
    @Param("tid", new IntPipe("tid")) tag_id: number,
  ) {
    return this.service.updateTag(dto.tag_name, tag_id, account_id);
  }

  /**
   * 查询某个分区下的视频
   * @param tag_id 标签id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否降序
   */
  @ApiOperation({
    summary: "查询某个分区下的视频",
    description: "分页查询某个分区下的所有视频",
  })
  @ApiResponsePage(R_VideoListItemDto)
  @Get(":tid/videos")
  videoList(
    @Param("tid", new IntPipe("tid")) tag_id: number,
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.service.videoList(tag_id, offset, limit, desc);
  }

  /**
   * 查询某个分区下的视频合集
   * @param tag_id 标签id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否降序
   */
  @ApiOperation({
    summary: "查询某个分区下的视频合集",
    description: "分页查询某个分区下的所有视频合集",
  })
  @ApiResponsePage(CollectionDtoA)
  @Get(":tid/collection")
  collectionList(
    @Param("tid", new IntPipe("tid")) tag_id: number,
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.service.collectionList(tag_id, offset, limit, desc);
  }

  /**
   * 分页获取标签
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否降序
   */
  @ApiOperation({
    summary: "分页获取标签",
    description: "分页获取所有标签",
  })
  @ApiResponsePage(TagInfoDto)
  @Get("/list")
  list(
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.service.list(offset, limit, desc);
  }
}
