import { ApiProperty } from "@nestjs/swagger";
import { AccountDto, CollectionDto } from "@src/types/docs/video/common";

// 分区(包含创建者的信息)
export class CollectionDtoA extends CollectionDto {
  @ApiProperty({ description: "创建者", type: AccountDto })
  creator: AccountDto;
}
