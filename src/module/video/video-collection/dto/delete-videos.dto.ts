import { IsArray, IsNumber } from "class-validator";

/**
 * 添加视频DTO
 */
export class DeleteVideosDto {
  /**
   * 需要添加的视频
   */
  // 该属性是数组
  @IsArray({ message: "添加的视频列表必须是数组型!" })
  // 对数组中每一个元素进行验证
  @IsNumber({}, { each: true, message: "视频id必须是数值型!" })
  video_id_list: number[];
}
