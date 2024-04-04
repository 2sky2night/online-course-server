import { ApiProperty } from "@nestjs/swagger";
import { BaseModel } from "@src/types/docs";

/**
 * 前台用户模型
 */
export class UserDto extends BaseModel {
  @ApiProperty({ description: "用户id", example: 1 })
  user_id: number;

  @ApiProperty({ description: "对应平台的用户id", example: "wqewqe13212" })
  platform_id: string;

  @ApiProperty({ description: "用户名称", example: "John Doe" })
  user_name: string;

  @ApiProperty({ description: "用户头像", example: null })
  avatar: string | null;

  @ApiProperty({ description: "用户性别", example: true })
  gender: boolean | null;

  @ApiProperty({ description: "用户年龄", example: 25 })
  age: number | null;
}
