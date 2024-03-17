import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

/**
 * 更新用户信息DTO
 */
export class UpdateUserProfileDto {
  /**
   * 用户名称
   */
  @ApiProperty({
    description: "账户名称",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "账户名必须是字符串!" })
  @MaxLength(15, { message: "账户名长度最长为15位!" })
  @MinLength(2, { message: "账户名长度最短为2位!" })
  user_name?: string;
  /**
   * 头像
   */
  @ApiProperty({ description: "头像", required: false })
  @IsOptional()
  @IsString({ message: "头像必须是字符串!" })
  avatar?: string;
  /**
   * 年龄
   */
  @ApiProperty({
    description: "年龄",
    required: false,
  })
  @IsOptional()
  @Max(200, { message: "年龄最大为200!" })
  @Min(1, { message: "年龄最小为0!" })
  @IsNumber(undefined, { message: "年龄必须是数字!" })
  age?: number;

  /**
   * 性别
   */
  @ApiProperty({
    description: "性别",
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: "年龄必须是布尔值!" })
  gender?: boolean;
}
