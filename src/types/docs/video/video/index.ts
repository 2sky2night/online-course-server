import { ApiProperty } from "@nestjs/swagger";
import { AccountDto } from "@src/types/docs/account";
import {
  PartitionDto,
  SourceDto,
  TagDto,
  VideoDto,
} from "@src/types/docs/video/common";

// 视频列表项
export class R_VideoListItemDto extends VideoDto {
  @ApiProperty({ description: "发布者信息" })
  publisher: AccountDto;

  @ApiProperty({ description: "观看数量" })
  view_count: number;

  @ApiProperty({ description: "评论数量，不包含回复数量" })
  comment_count: number;
}

// 视频动态数据
export class VideoDataCountDto {
  @ApiProperty({ description: "视频观看次数", example: 1212 })
  views: number;

  @ApiProperty({ description: "视频点赞数", example: 123 })
  likes: number;

  @ApiProperty({ description: "视频收藏数", example: 123 })
  stars: number;

  @ApiProperty({ description: "评论数量，不包括回复数量", example: 123 })
  comments: number;
}

// 视频详情信息
export class R_VideoInfoDto extends R_VideoListItemDto {
  @ApiProperty({ description: "分区信息" })
  partition: PartitionDto;

  @ApiProperty({ description: "视频源信息", type: [SourceDto] })
  source: SourceDto[];

  @ApiProperty({ description: "视频标签信息", type: [TagDto] })
  tags: TagDto[];

  @ApiProperty({ description: "视频动态信息", type: VideoDataCountDto })
  count: VideoDataCountDto;
}

// 视频浏览量
export class R_VideoViewsCount {
  @ApiProperty({
    description: "视频浏览量",
  })
  count: number;
}

// 视频实时观看数量
export class R_VideoWatchCount {
  @ApiProperty({
    description: "视频实时观看数量",
  })
  count: number;
}

// 用户对视频的态度(点赞、收藏)
export class R_GetVideoStatus {
  @ApiProperty({
    description: "是否收藏",
  })
  is_star: boolean;
  @ApiProperty({
    description: "是否点赞",
  })
  is_like: boolean;
}
