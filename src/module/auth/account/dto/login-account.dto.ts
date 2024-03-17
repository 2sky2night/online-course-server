import { IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * 登录账户的传输对象
 */
export class LoginAccountDto {
  @ApiProperty({
    description: "账户名",
  })
  @IsString({ message: "账户名必须是字符串" })
  @MaxLength(15, { message: "账户名长度最长为15位" })
  @MinLength(2, { message: "账户名长度最短为2位" })
  username: string;
  @ApiProperty({
    description: "密码",
  })
  @IsString({ message: "密码必须是字符串" })
  @MaxLength(14, { message: "密码长度最长为14位" })
  @MinLength(6, { message: "密码长度最短为6位" })
  password: string;
}
