import {
  IsEmail,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Roles } from "@src/module/account/module/role/enum";
import { ApiProperty } from "@nestjs/swagger";

/**
 * 申请账户的表单
 */
export class ApplyAccountDto {
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

  @ApiProperty({
    description: "绑定的邮箱",
  })
  @IsEmail(undefined, { message: "邮箱格式不正确!" })
  email: string;

  @ApiProperty({
    description: "申请注册的原因",
  })
  @IsString({ message: "申请原因必须是字符串" })
  @MaxLength(255, { message: "申请原因长度最长为255位" })
  @MinLength(20, { message: "申请原因长度最短为20位" })
  description: string;

  @ApiProperty({
    description: "申请注册的角色",
    enum: [Roles.TEACHER, Roles.ADMIN],
  })
  @IsEnum([Roles.TEACHER, Roles.ADMIN], { message: "申请的角色错误!" })
  role_name: Roles.TEACHER | Roles.ADMIN;
}
