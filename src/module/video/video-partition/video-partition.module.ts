import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VideoPartition } from "@src/module/video/video-partition/entity";
import { AccountModule } from "@src/module/account/account.module";
import { VideoPartitionController } from "@src/module/video/video-partition/video-partition.controller";
import { VideoPartitionService } from "@src/module/video/video-partition/video-partition.service";

/**
 * 视频分区模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([VideoPartition]), AccountModule],
  controllers: [VideoPartitionController],
  providers: [VideoPartitionService],
  exports: [VideoPartitionService],
})
export class VideoPartitionModule {}
