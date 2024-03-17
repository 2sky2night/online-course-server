import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class EmailLoginDto {
  @ApiProperty({
    description: "邮箱地址",
  })
  @IsEmail(undefined, { message: "邮箱地址必须合法!" })
  email: string;

  @ApiProperty({
    description: "验证码",
  })
  @IsString({ message: "验证码必须是字符类型!" })
  code: string;
}
