import { ApiProperty } from "@nestjs/swagger";
import { BaseModel } from "@src/types/docs";

/**
 * 视频
 */
export class VideoDto extends BaseModel {
  @ApiProperty({ description: "视频id", example: 1 })
  video_id: number;

  @ApiProperty({ description: "视频名称", example: "Awesome Video" })
  video_name: string;

  @ApiProperty({
    description: "视频封面",
    nullable: true,
    example: "https://example.com/video-cover.jpg",
  })
  video_cover: string | null;

  @ApiProperty({
    description: "视频描述",
    nullable: true,
    example: "This is an amazing video!",
  })
  description: string | null;

  @ApiProperty({ description: "视频时长，秒为单位", example: 120 })
  duration: number;
}

/**
 * m3u8视频源
 */
export class SourceDto extends BaseModel {
  @ApiProperty({ description: "M3U8 ID", example: 1 })
  m3u8_id: number;

  @ApiProperty({
    description: "文件路径",
    example: "/cbd286fc455a610605a1cc47d6e94804/720/index.m3u8",
  })
  file_path: string;

  @ApiProperty({ description: "分辨率", example: 720 })
  resolution: number;
}

/**
 * 后台用户
 */
export class AccountDto extends BaseModel {
  @ApiProperty({ description: "账户ID", example: 1 })
  account_id: number;

  @ApiProperty({ description: "账户名", example: "john_doe" })
  account_name: string;

  @ApiProperty({ description: "头像", required: false, example: null })
  avatar: string | null;

  @ApiProperty({ description: "邮箱", example: "john@example.com" })
  email: string;
}

/**
 * 视频标签
 */
export class TagDto extends BaseModel {
  @ApiProperty({ description: "标签ID", example: 121 })
  tag_id: number;

  @ApiProperty({ description: "标签名称", example: "wdsd" })
  tag_name: string;
}

/**
 * 视频分区
 */
export class PartitionDto extends BaseModel {
  @ApiProperty({ description: "分区ID", example: 1 })
  partition_id: number;

  @ApiProperty({ description: "分区名称", example: "asd" })
  partition_name: string;
}

/**
 * 视频合集
 */
export class CollectionDto extends BaseModel {
  @ApiProperty({ description: "集合ID", example: 3 })
  collection_id: number;

  @ApiProperty({ description: "集合名称", example: "门特厂" })
  collection_name: string;

  @ApiProperty({
    description: "描述",
    example:
      "保三我解上由但动则使选体定军委电约油然较信段儿党备节状算什着价石理极质自提也最同好红技亲中主维增联件说五难在科进太月百半门片又般金过关龙约。",
  })
  description: string;

  @ApiProperty({ description: "集合封面", example: null })
  collection_cover: string | null;
}

/**
 * 评论
 */
export class CommentDto extends BaseModel {
  @ApiProperty({ description: "评论ID", example: 2 })
  comment_id: number;

  @ApiProperty({
    description: "评论内容",
    example: "aliquip reprehenderit quis",
  })
  content: string;

  @ApiProperty({
    description: "评论图片",
    type: [String],
    example: ["http://dummyimage.com/400x400", "http://dummyimage.com/200x200"],
    nullable: true,
  })
  images: string[] | null;
}

/**
 * 回复
 */
export class ReplyDto extends BaseModel {
  @ApiProperty({ description: "回复ID", example: 3 })
  reply_id: number;

  @ApiProperty({ description: "回复内容", example: "incididunt esse dolor" })
  content: string;

  @ApiProperty({
    description: "回复图片",
    type: [String],
    example: null,
    nullable: true,
  })
  images: string[] | null;

  @ApiProperty({
    description: "引用的回复id,null为回复的评论，其他为回复的回复",
    example: null,
    nullable: true,
  })
  ref_id: number | null;
}

/**
 * 弹幕
 */
export class DanmuDto extends BaseModel {
  @ApiProperty({ description: "弹幕ID", example: 1 })
  danmu_id: number;

  @ApiProperty({
    description: "弹幕内容",
    example: "dolor magna in nulla commodo",
  })
  content: string;

  @ApiProperty({ description: "弹幕时间", example: 21.99 })
  time: number;
}

export class FavoriteDto extends BaseModel {
  @ApiProperty({ description: "收藏ID", example: 0 })
  favorite_id: number;

  @ApiProperty({ description: "收藏名称", example: "string" })
  favorite_name: string;

  @ApiProperty({ description: "收藏描述", example: "string" })
  description: string;
}
