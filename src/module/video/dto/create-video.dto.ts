import { IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

/**
 * 上传视频DTO
 */
export class CreateVideoDto {
  /**
   * 视频名称
   */
  @IsString({ message: "视频名称必须是字符型!" })
  video_name: string;
  /**
   * 视频的描述
   */
  @IsOptional()
  @IsString({ message: "视频的描述必须是字符型!" })
  @MaxLength(255, { message: "视频的描述最长为255位!" })
  description: string | null;
  /**
   * 视频指定的文件id
   */
  @IsNumber(undefined, { message: "文件记录id必须是数字型!" })
  file_trace_id: number;
}
