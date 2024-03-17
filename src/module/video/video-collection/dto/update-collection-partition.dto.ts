import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

/**
 * 修改视频合集分区DTO
 */
export class UpdateCollectionPartitionDto {
  @ApiProperty({
    description: "分区id",
  })
  @IsNumber({}, { message: "视频分区id必须是数字型!" })
  partition_id: number;
}
