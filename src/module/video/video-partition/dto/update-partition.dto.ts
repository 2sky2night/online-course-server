import { IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * 更新分区信息DTO
 */
export class UpdatePartitionDto {
  @ApiProperty({
    description: "分区名称",
  })
  @IsString({ message: "视频分区的名称必须是字符型" })
  @MinLength(1, { message: "视频分区的名称最短为1位!" })
  @MaxLength(15, { message: "视频分区的名称最长为15位!" })
  partition_name: string;
}
