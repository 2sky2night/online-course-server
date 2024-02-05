import {
  Body,
  Controller,
  Inject,
  Post,
  UseGuards,
  Patch,
  Param,
  Get,
  Query,
} from "@nestjs/common";
import { VideoPartitionService } from "@src/module/video/video-partition/video-partition.service";
import { AccountToken, Role } from "@src/common/decorator";
import { Roles } from "@src/module/account/module/role/enum";
import { AccountGuard, RoleGuard } from "@src/common/guard";
import {
  CreatePartitionDto,
  UpdatePartitionDto,
} from "@src/module/video/video-partition/dto";
import { BooleanPipe, IntPipe, LimitPipe, OffsetPipe } from "@src/common/pipe";

/**
 * 视频分区控制层
 */
@Controller("video/partition")
export class VideoPartitionController {
  /**
   * 服务层
   * @private
   */
  @Inject(VideoPartitionService)
  private service: VideoPartitionService;

  /**
   * 创建分区
   * @param account_id 账户id
   * @param dto 表单
   */
  @Post()
  @Role(Roles.ADMIN, Roles.SUPER_ADMIN)
  @UseGuards(AccountGuard, RoleGuard)
  addPartition(
    @AccountToken("sub") account_id: number,
    @Body() dto: CreatePartitionDto,
  ) {
    return this.service.addPartition(account_id, dto.partition_name);
  }

  /**
   * 修改分区信息
   * @param account_id 账户
   * @param partition_id 分区id
   * @param dto 表单
   */
  @Patch(":pid")
  @Role(Roles.ADMIN, Roles.SUPER_ADMIN)
  @UseGuards(AccountGuard, RoleGuard)
  updatePartition(
    @AccountToken("sub") account_id: number,
    @Param("pid", new IntPipe("pid")) partition_id: number,
    @Body() dto: UpdatePartitionDto,
  ) {
    return this.service.updatePartition(
      account_id,
      partition_id,
      dto.partition_name,
    );
  }

  /**
   * 获取分区列表
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否按照创建时间降序
   */
  @Get()
  list(
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.service.list(offset, limit, desc);
  }
}
