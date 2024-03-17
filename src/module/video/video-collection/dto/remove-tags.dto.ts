import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber } from "class-validator";

/**
 * 移除视频标签DTO
 */
export class RemoveTagsDto {
  @ApiProperty({
    description: "视频标签id列表",
    type: "array",
    items: {
      type: "number",
    },
    examples: [1, 2, 3],
  })
  @IsArray({ message: "视频标签列表必须是数组型!" })
  @IsNumber({}, { message: "视频标签id必须是数字型!", each: true })
  tag_id_list: number[];
}
