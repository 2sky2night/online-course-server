import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

/**
 * 创建标签DTO
 */
export class CreateTagDto {
  @ApiProperty({
    description: "标签名称",
  })
  @IsString({ message: "视频标签的名称必须是字符型!" })
  @MinLength(1, { message: "视频标签的名称最短为1位!" })
  @MaxLength(15, { message: "视频标签的名称最长为15位!" })
  tag_name: string;
}
