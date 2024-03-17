import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * 上传视频DTO
 */
export class PublishVideoDto {
  /**
   * 视频名称
   */
  @ApiProperty({
    description: "视频名称",
  })
  @IsString({ message: "视频名称必须是字符型!" })
  @MinLength(1, { message: "视频名称最少为1位!" })
  @MaxLength(20, { message: "视频名称最长为20位!" })
  video_name: string;
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
   * 文件id
   */
  @ApiProperty({
    description: "视频对应的文件id",
  })
  @IsNumber(undefined, { message: "文件id必须是数字型!" })
  file_id: number;

  /**
   * 视频合集id列表
   */
  @ApiProperty({
    description: "要将此视频添加到哪些合集中去",
    required: false,
    type: "array",
    items: {
      type: "number",
    },
  })
  @IsOptional()
  @IsArray({ message: "视频合集id列表必须是数组型!" })
  @IsNumber({}, { each: true, message: "视频合集id必须是数字型" })
  collection_id_list?: number[];

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
  /**
   * 视频分区id
   */
  @ApiProperty({
    description: "视频的分区",
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: "视频分区id必须是数字型!" })
  partition_id?: number;
  /**
   * 视频标签id列表
   */
  @ApiProperty({
    description: "视频的标签",
    required: false,
    type: "array",
    items: {
      type: "number",
    },
  })
  @IsOptional()
  @IsArray({ message: "视频标签列表必须是数组型!" })
  @IsNumber({}, { message: "视频标签id必须是数字型!", each: true })
  tag_id_list?: number[];
}
