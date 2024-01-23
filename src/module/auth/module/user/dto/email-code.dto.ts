import { IsEmail } from "class-validator";

export class EmailCodeDto {
  @IsEmail(undefined, { message: "邮箱地址必须合法" })
  email: string;
}
