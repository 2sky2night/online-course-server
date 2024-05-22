import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { HealthCheck } from "@nestjs/terminus";
import { ApiResponse, Role } from "@src/common/decorator";
import { AccountGuard, RoleGuard } from "@src/common/guard";
import { Roles } from "@src/module/account/module/role/enum";
import { MonitorService } from "@src/module/monitor/monitor.service";
import { ResponseDto } from "@src/types/docs";
import { SystemUsageDto } from "@src/types/docs/monitor";

@ApiTags("Monitor")
@ApiBearerAuth() // 标明此控制器的所有接口需要Bearer类型的token验证
@ApiExtraModels(ResponseDto)
@Controller("monitor")
export class MonitorController {
  /**
   * 服务层
   * @private
   */
  @Inject(MonitorService)
  private service: MonitorService;

  /**
   * 数据库连接检测测试
   */
  @Get("database")
  @Role(Roles.SUPER_ADMIN)
  @UseGuards(AccountGuard, RoleGuard)
  @HealthCheck()
  checkDatabase() {
    return this.service.checkDatabase();
  }

  @ApiOperation({
    summary: "获取系统资源使用情况",
    description: "获取系统资源使用情况",
  })
  @ApiResponse(SystemUsageDto)
  @Get("usage")
  @Role(Roles.SUPER_ADMIN)
  @UseGuards(AccountGuard, RoleGuard)
  getSystemUsage() {
    return this.service.getSystemUsage();
  }

  @Get("/error-log")
  @Role(Roles.SUPER_ADMIN)
  @UseGuards(AccountGuard, RoleGuard)
  getErrorLog() {
    return this.service.getErrorLog();
  }
}
