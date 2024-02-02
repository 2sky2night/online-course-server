import { IsEmail } from "class-validator";

/**
 * 获取登录验证码DTO
 */
export class EmailCodeDto {
  @IsEmail(undefined, { message: "邮箱格式不正确!" })
  email: string;
}
