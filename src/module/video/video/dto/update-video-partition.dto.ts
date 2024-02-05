import { IsNumber } from "class-validator";

/**
 * 修改视频分区DTO
 */
export class UpdateVideoPartitionDto {
  @IsNumber({}, { message: "视频分区id必须是数字型!" })
  partition_id: number;
}
