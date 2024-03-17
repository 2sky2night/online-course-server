import { IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * 获取登录验证码DTO
 */
export class EmailCodeDto {
  @ApiProperty({
    description: "要获取邮箱登录验证码的邮箱地址",
  })
  @IsEmail(undefined, { message: "邮箱格式不正确!" })
  email: string;
}
