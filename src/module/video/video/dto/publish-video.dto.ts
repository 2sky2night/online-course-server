import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

/**
 * 上传视频DTO
 */
export class PublishVideoDto {
  /**
   * 视频名称
   */
  @IsString({ message: "视频名称必须是字符型!" })
  @MinLength(1, { message: "视频名称最少为1位!" })
  @MaxLength(20, { message: "视频名称最长为20位!" })
  video_name: string;
  /**
   * 视频的描述
   */
  @IsOptional()
  @IsString({ message: "视频的描述必须是字符型!" })
  @MinLength(1, { message: "视频的描述最少为1位!" })
  @MaxLength(255, { message: "视频的描述最长为255位!" })
  description?: string;
  /**
   * 文件id
   */
  @IsNumber(undefined, { message: "文件id必须是数字型!" })
  file_id: number;
  /**
   * 视频合集id列表
   */
  @IsOptional()
  @IsArray({ message: "视频合集id列表必须是数组型!" })
  @IsNumber({}, { each: true, message: "视频合集id必须是数字型" })
  collection_id_list?: number[];

  // TODO 视频封面
}
