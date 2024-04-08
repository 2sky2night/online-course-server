import { ApiProperty } from "@nestjs/swagger";

export class CpuDto {
  @ApiProperty({ description: "cpu核心数量", example: 12 })
  cpu_count: number;
  @ApiProperty({ description: "cpu使用率，百分比", example: 20 })
  usage: number;
}

export class MemoryDto {
  @ApiProperty({ description: "内存大小，字节", example: 12 })
  size: number;
  @ApiProperty({ description: "内存使用率，百分比", example: 80 })
  usage: number;
}

export class DiskDto {
  @ApiProperty({ description: "磁盘大小，字节", example: 12 })
  size: number;
  @ApiProperty({ description: "磁盘使用率，百分比", example: 80 })
  usage: number;
  @ApiProperty({ description: "分区名称", example: "C:" })
  fs: string;
  @ApiProperty({ description: "分区名称", example: "C:" })
  mount: string;
}

export class NetworkDto {
  @ApiProperty({ description: " 网络下载速度（MB）", example: 10 })
  download: number;
  @ApiProperty({ description: " 网络上传速度（MB）", example: 10 })
  upload: number;
}

export class SystemUsageDto {
  @ApiProperty({ description: "cpu相关信息", type: CpuDto })
  cpu: CpuDto;
  @ApiProperty({ description: "内存相关信息", type: MemoryDto })
  memory: MemoryDto;
  @ApiProperty({ description: "磁盘相关信息", type: [DiskDto] })
  disk: DiskDto[];
  @ApiProperty({ description: "网络相关信息", type: NetworkDto })
  network: NetworkDto;
}
