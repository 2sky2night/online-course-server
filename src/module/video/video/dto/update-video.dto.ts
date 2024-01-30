import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/**
 * 更新视频信息DTO
 */
export class UpdateVideoDto {
  /**
   * 视频名称
   */
  @IsOptional()
  @IsString({ message: "视频名称必须是字符型!" })
  @MinLength(1, { message: "视频名称最少为1位!" })
  @MaxLength(20, { message: "视频名称最长为20位!" })
  video_name?: string;
  /**
   * 视频的描述
   */
  @IsOptional()
  @IsString({ message: "视频的描述必须是字符型!" })
  @MinLength(1, { message: "视频的描述最少为1位!" })
  @MaxLength(255, { message: "视频的描述最长为255位!" })
  description?: string;
}
