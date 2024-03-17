import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber } from "class-validator";

/**
 * 从收藏夹中移除一些视频
 */
export class RemoveVideosDto {
  @ApiProperty({
    description: "视频id列表",
    type: "array",
    items: {
      type: "number",
    },
    example: [1, 2, 3],
  })
  @IsArray({ message: "视频id列表必须是数组型!" })
  @IsNumber({}, { message: "视频id必须是数值型!", each: true })
  video_id_list: number[];
}
