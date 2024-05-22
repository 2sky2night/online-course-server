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
  CreatePartitionDto,
  UpdatePartitionDto,
} from "@src/module/video/video-partition/dto";
import { VideoPartitionService } from "@src/module/video/video-partition/video-partition.service";
import { ResponseDto } from "@src/types/docs";
import { PartitionInfoDto } from "@src/types/docs/video/partition";

/**
 * 视频分区控制层
 */
@ApiTags("VideoPartition")
@ApiBearerAuth() // 标明此控制器的所有接口需要Bearer类型的token验证
@ApiExtraModels(ResponseDto)
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
  @ApiOperation({
    summary: "创建分区",
    description: "后台账户创建分区",
  })
  @ApiResponseEmpty()
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
  @ApiOperation({
    summary: "修改分区信息",
    description: "后台账户修改分区信息",
  })
  @ApiResponseEmpty()
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
  @ApiOperation({
    summary: "获取分区列表",
    description: "获取分区列表",
  })
  @ApiResponsePage(PartitionInfoDto)
  @Get()
  list(
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.service.list(offset, limit, desc);
  }

  /**
   * 获取分区详情
   * @param partition_id 分区id
   */
  @ApiOperation({
    summary: "获取分区详情",
    description: "获取分区详情",
  })
  @ApiResponse(PartitionInfoDto)
  @Get(":pid")
  info(@Param("pid", new IntPipe("pid")) partition_id: number) {
    return this.service.info(partition_id);
  }

  @ApiOperation({
    summary: "删除分区",
    description: "软删除分区",
  })
  @ApiResponseEmpty()
  @Delete(":pid")
  @Role(Roles.ADMIN, Roles.SUPER_ADMIN)
  @UseGuards(AccountGuard, RoleGuard)
  deletePartition(@Param("pid") partition_id: number) {
    return this.service.deletePartition(partition_id);
  }
}
