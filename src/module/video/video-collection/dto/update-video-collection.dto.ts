import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/**
 * 更新视频合集DTO
 */
export class UpdateVideoCollectionDto {
  /**
   * 合集名称
   */
  @ApiProperty({
    description: "合集名称",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "视频合集的名称必须是字符型!" })
  @MinLength(1, { message: "视频合集的名称最少为1位!" })
  @MaxLength(20, { message: "视频合集的名称最长为20位!" })
  collection_name?: string;
  /**
   * 合集描述
   */
  @ApiProperty({
    description: "合集描述",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "视频合集描述必须是字符型!" })
  @MinLength(1, { message: "视频合集描述最少为1位!" })
  @MaxLength(255, { message: "视频合集描述最长为255位!" })
  description?: string;
  /**
   * 视频合集封面
   */
  @ApiProperty({
    description: "视频合集封面",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "视频合集的封面必须是字符型!" })
  collection_cover?: string;
}
