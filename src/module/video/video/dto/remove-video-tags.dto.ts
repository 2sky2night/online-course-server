import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber } from "class-validator";

/**
 * 给视频移除标签
 */
export class RemoveVideoTagsDto {
  @ApiProperty({
    description: "标签id列表",
    type: "array",
    items: {
      type: "number",
    },
  })
  @IsArray({ message: "视频标签列表必须是数组型!" })
  @IsNumber({}, { message: "视频标签id必须是数字型!", each: true })
  tag_id_list: number[];
}
