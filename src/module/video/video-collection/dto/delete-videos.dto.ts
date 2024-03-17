import { IsArray, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * 移除视频DTO
 */
export class DeleteVideosDto {
  @ApiProperty({
    description: "视频id列表",
    type: "array",
    items: {
      type: "number",
    },
    examples: [1, 2, 3],
  })
  /**
   * 需要移除的视频
   */
  // 该属性是数组
  @IsArray({ message: "添加的视频列表必须是数组型!" })
  // 对数组中每一个元素进行验证
  @IsNumber({}, { each: true, message: "视频id必须是数值型!" })
  video_id_list: number[];
}
