import { IsArray, IsNumber } from "class-validator";

/**
 * 移除视频标签DTO
 */
export class RemoveTagsDto {
  @IsArray({ message: "视频标签列表必须是数组型!" })
  @IsNumber({}, { message: "视频标签id必须是数字型!", each: true })
  tag_id_list: number[];
}
