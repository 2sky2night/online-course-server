import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

/**
 * 创建视频合集DTO
 */
export class CreateVideoCollectionDto {
  /**
   * 合集名称
   */
  @IsString({ message: "视频合集必须是字符型!" })
  @MinLength(1, { message: "视频合集的名称最少为1位!" })
  @MaxLength(20, { message: "视频合集的名称最长为20位!" })
  collection_name: string;
  /**
   * 合集描述
   */
  @IsOptional()
  @IsString({ message: "视频合集描述必须是字符型!" })
  @MinLength(1, { message: "视频合集描述最少为1位!" })
  @MaxLength(255, { message: "视频合集描述最长为255位!" })
  description?: string;

  /**
   * 需要添加的视频
   */
  @IsOptional()
  // 该属性是数组
  @IsArray({ message: "添加的视频列表必须是数组型!" })
  // 对数组中每一个元素进行验证
  @IsNumber({}, { each: true, message: "视频id必须是数值型!" })
  video_id_list?: number[];
  /**
   * 视频合集封面
   */
  @IsOptional()
  @IsString({ message: "视频合集的封面必须是字符型!" })
  collection_cover?: string;
  /**
   * 视频分区id
   */
  @IsOptional()
  @IsNumber({}, { message: "视频分区id必须是数字型!" })
  partition_id?: number;
}
