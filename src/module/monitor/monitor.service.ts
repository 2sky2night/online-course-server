import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { HealthCheckService, TypeOrmHealthIndicator } from "@nestjs/terminus";
import { MonitorMessage } from "@src/config/message";
import * as si from "systeminformation";

@Injectable()
export class MonitorService {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  /**
   * 检查数据库连接
   */
  checkDatabase() {
    return this.health.check([() => this.db.pingCheck("database")]);
  }

  /**
   * 查询系统资源占用率
   */
  async getSystemUsage() {
    try {
      const cpuUsage = await si.currentLoad();
      const memoryUsage = await si.mem();
      const diskUsage = await si.fsSize();
      const networkStats = await si.networkStats();
      // CPU 使用率（百分比）
      const cpu = cpuUsage.currentLoad;

      // 内存使用率（百分比）
      const memory = (memoryUsage.used / memoryUsage.total) * 100;

      // 网络下载速度（MB）
      const download = networkStats[0].rx_sec / (1024 * 1024);

      // 网络上传速度（MB）
      const upload = networkStats[0].tx_sec / (1024 * 1024);

      return {
        cpu: {
          usage: cpu,
          core_count: cpuUsage.cpus.length,
        },
        memory: {
          usage: memory,
          size: memoryUsage.total,
        },
        disk: diskUsage.map((item) => {
          return {
            usage: item.use,
            size: item.size,
            fs: item.fs,
            mount: item.mount,
          };
        }),
        network: { download, upload },
      };
    } catch (e) {
      Logger.error(e);
      throw new InternalServerErrorException(MonitorMessage.system_call_error);
    }
  }
}
