import { ApiProperty } from "@nestjs/swagger";
import { UserDto } from "@src/types/docs/user";

import { DanmuDto } from "../common";

/**
 * 弹幕列表项，包含弹幕发布者字段
 */
export class DanmuDtoA extends DanmuDto {
  @ApiProperty({ description: "发布弹幕的创建者", type: UserDto })
  user: UserDto;
}
