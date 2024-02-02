import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

/**
 * 添加评论
 */
export class AddCommentDto {
  /**
   * 视频id
   */
  @IsNumber({}, { message: "视频id必须是数值型!" })
  video_id: number;
  /**
   * 评论内容
   */
  @IsString({ message: "评论内容必须是字符型!" })
  @MinLength(1, { message: "评论内容长度最短为1个字符!" })
  @MaxLength(255, { message: "评论内容长度最长为255个字符!" })
  content: string;
  /**
   * 配图
   */
  @IsOptional()
  @IsArray({ message: "配图必须是数组型!" })
  @IsString({ each: true, message: "配图项必须是字符型!" })
  images: string[];
}
