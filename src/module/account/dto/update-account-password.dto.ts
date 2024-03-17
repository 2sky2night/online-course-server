import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

/**
 * 更新账户密码DTO
 */
export class UpdateAccountPasswordDto {
  @ApiProperty({
    description: "新密码",
  })
  @IsString({ message: "新密码必须是字符串" })
  @MaxLength(14, { message: "新密码长度最长为14位" })
  @MinLength(6, { message: "新密码长度最短为6位" })
  password: string;
  @ApiProperty({
    description: "旧密码",
  })
  @IsString({ message: "旧密码必须是字符串" })
  @MaxLength(14, { message: "旧密码长度最长为14位" })
  @MinLength(6, { message: "旧密码长度最短为6位" })
  old_password: string;
}
