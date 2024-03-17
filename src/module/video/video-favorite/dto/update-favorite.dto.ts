import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/**
 * 更新视频收藏夹DTO
 */
export class UpdateFavoriteDto {
  @ApiProperty({
    description: "收藏夹名称",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "收藏夹名称必须是字符型" })
  @MinLength(1, { message: "收藏夹名称最短为1位!" })
  @MaxLength(20, { message: "收藏夹名称最长为20位!" })
  favorite_name?: string;
  @ApiProperty({
    description: "收藏夹描述",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "收藏夹描述必须是字符型" })
  @MinLength(1, { message: "收藏夹描述最短为1位!" })
  @MaxLength(200, { message: "收藏夹描述最长为200位!" })
  description?: string;
}
