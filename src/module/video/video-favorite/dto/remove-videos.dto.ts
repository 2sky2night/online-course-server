import { IsArray, IsNumber } from "class-validator";

/**
 * 从收藏夹中移除一些视频
 */
export class RemoveVideosDto {
  @IsArray({ message: "视频id列表必须是数组型!" })
  @IsNumber({}, { message: "视频id必须是数值型!", each: true })
  video_id_list: number[];
}
