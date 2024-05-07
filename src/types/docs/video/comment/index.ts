import { ApiProperty } from "@nestjs/swagger";
import { UserDto } from "@src/types/docs/user";

import { CommentDto } from "../common";

/**
 * 评论项的基本信息
 */
export class CommentDtoA extends CommentDto {
  @ApiProperty({ description: "评论创建者", type: UserDto })
  user: UserDto;
  @ApiProperty({ description: "回复数量" })
  reply_count: number;
}
