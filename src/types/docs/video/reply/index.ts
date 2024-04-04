import { ApiProperty } from "@nestjs/swagger";
import { UserDto } from "@src/types/docs/user";
import { ReplyDto } from "@src/types/docs/video/common";

/**
 * 回复列表项，包含回复的创建者信息
 */
export class ReplyDtoA extends ReplyDto {
  @ApiProperty({ description: "回复的创建者", type: UserDto })
  user: UserDto;
}
