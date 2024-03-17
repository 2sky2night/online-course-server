import { IsArray, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * 给视频添加标签
 */
export class AddVideoTagsDto {
  @ApiProperty({
    description: "视频标签列表",
    type: "array",
    items: {
      type: "number",
    },
    examples: [1, 5],
  })
  @IsArray({ message: "视频标签列表必须是数组型!" })
  @IsNumber({}, { message: "视频标签id必须是数字型!", each: true })
  tag_id_list: number[];
}
