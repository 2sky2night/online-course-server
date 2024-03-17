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
 * 创建视频合集DTO
 */
export class CreateVideoCollectionDto {
  /**
   * 合集名称
   */
  @ApiProperty({
    description: "合集名称",
  })
  @IsString({ message: "视频合集必须是字符型!" })
  @MinLength(1, { message: "视频合集的名称最少为1位!" })
  @MaxLength(20, { message: "视频合集的名称最长为20位!" })
  collection_name: string;
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
   * 需要添加的视频
   */
  @ApiProperty({
    description: "将哪些视频添加到合集中？",
    required: false,
    type: "array",
    items: {
      type: "number",
    },
    examples: [12, 213, 21],
  })
  @IsOptional()
  // 该属性是数组
  @IsArray({ message: "添加的视频列表必须是数组型!" })
  // 对数组中每一个元素进行验证
  @IsNumber({}, { each: true, message: "视频id必须是数值型!" })
  video_id_list?: number[];
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
  /**
   * 视频分区id
   */
  @ApiProperty({
    description: "视频分区id，将此合集放在那个分区中?",
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: "视频分区id必须是数字型!" })
  partition_id?: number;
  /**
   * 视频合集的标签
   */
  @ApiProperty({
    description: "视频合集的标签？",
    required: false,
    type: "array",
    items: {
      type: "number",
    },
    examples: [1, 3, 8],
  })
  @IsOptional()
  @IsArray({ message: "视频标签列表必须是数组型!" })
  @IsNumber({}, { message: "视频标签id必须是数字型!", each: true })
  tag_id_list?: number[];
}
