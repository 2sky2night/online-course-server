import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class EmailLoginDto {
  @ApiProperty({
    description: "要登录的邮箱",
  })
  @IsEmail(undefined, { message: "邮箱地址必须合法!" })
  email: string;

  @ApiProperty({
    description: "邮箱验证码",
  })
  @IsString({ message: "验证码必须是字符类型!" })
  code: string;
}
