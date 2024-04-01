import { ApiProperty } from "@nestjs/swagger";
import { AccountDto } from "@src/types/docs/account";
import { TagDto } from "@src/types/docs/video/common";

/**
 * 标签详情信息
 */
export class TagInfoDto extends TagDto {
  @ApiProperty({ description: "发布者信息", type: AccountDto })
  account: AccountDto;
}
