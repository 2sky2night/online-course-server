import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * 更新视频信息DTO
 */
export class UpdateVideoDto {
  /**
   * 视频名称
   */
  @ApiProperty({
    description: "视频的名称",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "视频名称必须是字符型!" })
  @MinLength(1, { message: "视频名称最少为1位!" })
  @MaxLength(20, { message: "视频名称最长为20位!" })
  video_name?: string;
  /**
   * 视频的描述
   */
  @ApiProperty({
    description: "视频的描述",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "视频的描述必须是字符型!" })
  @MinLength(1, { message: "视频的描述最少为1位!" })
  @MaxLength(255, { message: "视频的描述最长为255位!" })
  description?: string;
  /**
   * 视频封面
   */
  @ApiProperty({
    description: "视频的封面",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "视频封面必须是字符型" })
  video_cover?: string;
}
