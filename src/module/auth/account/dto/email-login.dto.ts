import { IsEmail, IsString } from "class-validator";

export class EmailLoginDto {
  @IsEmail(undefined, { message: "邮箱地址必须合法!" })
  email: string;
  @IsString({ message: "验证码必须是字符类型!" })
  code: string;
}
