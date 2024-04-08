import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { MonitorController } from "@src/module/monitor/monitor.controller";
import { MonitorService } from "@src/module/monitor/monitor.service";

/**
 * 性能监控模块(我想要检测内存、cpu、网络吞吐等使用率)
 */
@Module({
  imports: [TerminusModule],
  controllers: [MonitorController],
  providers: [MonitorService],
})
export class MonitorModule {}
