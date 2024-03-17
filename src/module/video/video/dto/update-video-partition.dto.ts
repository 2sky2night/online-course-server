import { IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * 修改视频分区DTO
 */
export class UpdateVideoPartitionDto {
  @ApiProperty({
    description: "分区的id",
  })
  @IsNumber({}, { message: "视频分区id必须是数字型!" })
  partition_id: number;
}
