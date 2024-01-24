import { IsString, MaxLength, MinLength, IsOptional } from "class-validator";

/**
 * 更新账户信息DTO
 */
export class UpdateAccountProfileDto {
  @IsOptional()
  @IsString({ message: "账户名必须是字符串!" })
  @MaxLength(15, { message: "账户名长度最长为15位!" })
  @MinLength(2, { message: "账户名长度最短为2位!" })
  account_name?: string;
  @IsOptional()
  @IsString({ message: "头像必须是字符串!" })
  avatar?: string;
}
