import { IsArray, IsBoolean, IsNumber, IsOptional } from "class-validator";

/**
 * 收藏视频DTO
 */
export class AddVideoDto {
  @IsNumber({}, { message: "视频id必须是数值型!" })
  video_id: number;
  @IsOptional()
  @IsBoolean({ message: "是否收藏到默认收藏夹必须是布尔型!" })
  set_default?: boolean;
  @IsOptional()
  @IsArray({ message: "收藏夹id列表必须是数组!" })
  @IsNumber({}, { each: true, message: "收藏夹id必须是数值型!" })
  favorite_id_list?: number[];
}
