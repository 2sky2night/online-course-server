import { IsArray, IsBoolean, IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * 收藏视频DTO
 */
export class AddVideoDto {
  @ApiProperty({
    description: "视频id",
  })
  @IsNumber({}, { message: "视频id必须是数值型!" })
  video_id: number;
  @ApiProperty({
    description: "是否将视频收藏在默认收藏夹中",
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: "是否收藏到默认收藏夹必须是布尔型!" })
  set_default?: boolean;
  @ApiProperty({
    description: "收藏夹id列表,将视频收藏到这些收藏夹中",
    required: false,
    type: "array",
    items: {
      type: "number",
    },
    example: [1, 2, 3],
  })
  @IsOptional()
  @IsArray({ message: "收藏夹id列表必须是数组!" })
  @IsNumber({}, { each: true, message: "收藏夹id必须是数值型!" })
  favorite_id_list?: number[];
}
