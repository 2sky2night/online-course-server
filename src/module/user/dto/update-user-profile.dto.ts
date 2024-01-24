import {
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsNumber,
  Max,
  Min,
  IsBoolean,
} from "class-validator";

/**
 * 更新用户信息DTO
 */
export class UpdateUserProfileDto {
  /**
   * 用户名称
   */
  @IsOptional()
  @IsString({ message: "账户名必须是字符串!" })
  @MaxLength(15, { message: "账户名长度最长为15位!" })
  @MinLength(2, { message: "账户名长度最短为2位!" })
  user_name?: string;
  /**
   * 头像
   */
  @IsOptional()
  @IsString({ message: "头像必须是字符串!" })
  avatar?: string;
  /**
   * 年龄
   */
  @IsOptional()
  @Max(200, { message: "年龄最大为200!" })
  @Min(1, { message: "年龄最小为0!" })
  @IsNumber(undefined, { message: "年龄必须是数字!" })
  age: number;

  /**
   * 性别
   */
  @IsOptional()
  @IsBoolean({ message: "年龄必须是布尔值!" })
  gender: boolean;
}
