import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, MaxLength, Min, MinLength } from "class-validator";

/**
 * 创建弹幕
 */
export class CreateDanmuDto {
  /**
   * 弹幕内容
   */
  @ApiProperty({
    description: "弹幕内容",
  })
  @IsString({ message: "弹幕内容必须是字符型!" })
  @MaxLength(100, { message: "弹幕内容最长为100个字符!" })
  @MinLength(1, { message: "弹幕内容最少为1个字符!" })
  content: string;
  /**
   * 弹幕时间
   */
  @ApiProperty({
    description: "弹幕时间",
  })
  @IsNumber({}, { message: "弹幕时间必须是数值型" })
  @Min(0, { message: "弹幕时间最小为0!" })
  time: number;
}
