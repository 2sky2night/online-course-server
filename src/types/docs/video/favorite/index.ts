import { ApiProperty } from "@nestjs/swagger";
import { FavoriteDto } from "@src/types/docs/video/common";

class FavoriteItemDto extends FavoriteDto {
  @ApiProperty({ description: "收藏状态", example: true })
  favorite_state: boolean;
}

/**
 * 用户某一些收藏夹对此视频的收藏状态
 */
export class FavoriteListDto {
  @ApiProperty({ description: "收藏夹列表", type: [FavoriteItemDto] })
  list: FavoriteItemDto[];

  @ApiProperty({ description: "默认状态", example: true })
  default_state: boolean;

  @ApiProperty({ description: "总数", example: 0 })
  total: number;

  @ApiProperty({ description: "是否有更多", example: true })
  has_more: boolean;
}
