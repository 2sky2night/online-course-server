import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * 发布回复DTO
 */
export class CreateReplyDto {
  @ApiProperty({
    description: "回复的评论id",
  })
  /**
   * 回复的评论
   */
  @IsNumber({}, { message: "评论id必须是数字型!" })
  comment_id: number;
  /**
   * 回复内容
   */
  @ApiProperty({
    description: "回复的内容",
  })
  @IsString({ message: "回复的内容必须是字符型!" })
  @MinLength(1, { message: "回复的内容长度最短为1个字符!" })
  @MaxLength(255, { message: "回复的内容长度最长为255个字符!" })
  content: string;
  /**
   * 回复配图
   */
  @ApiProperty({
    description: "回复的配图",
    type: "array",
    required: false,
    items: {
      type: "string",
    },
  })
  @IsOptional()
  @IsArray({ message: "评论的配图必须是数组!" })
  @IsString({ message: "评论的配图项必须是字符型!", each: true })
  images?: string[];
  /**
   * 引用的回复id
   */
  @ApiProperty({
    required: false,
    description: "引用的回复id",
  })
  @IsOptional()
  @IsNumber({}, { message: "回复id必须是数字型!" })
  ref_id?: number;
}
