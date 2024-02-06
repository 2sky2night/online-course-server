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
import { VideoTagService } from "@src/module/video/video-tag/video-tag.service";
import { AccountToken, Role } from "@src/common/decorator";
import { CreateTagDto, UpdateTagDto } from "@src/module/video/video-tag/dto";
import { Roles } from "@src/module/account/module/role/enum";
import { AccountGuard, RoleGuard } from "@src/common/guard";
import { BooleanPipe, IntPipe, LimitPipe, OffsetPipe } from "@src/common/pipe";

/**
 * 视频标签控制层
 */
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
  @Get("/list")
  list(
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.service.list(offset, limit, desc);
  }
}
