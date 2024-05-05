import { ApiProperty } from "@nestjs/swagger";
import { AccountDto } from "@src/types/docs/account";
import { PartitionDto } from "@src/types/docs/video/common";

export class PartitionInfoDto extends PartitionDto {
  @ApiProperty({ description: "发布者信息", type: AccountDto })
  account: AccountDto;

  @ApiProperty({ description: "分区下的视频数量" })
  video_count: number;
}
