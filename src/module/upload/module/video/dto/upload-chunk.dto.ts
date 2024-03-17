import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

/**
 * 上传切片的DTO
 */
export class UploadChunkDto {
  /**
   * 文件的hash
   */
  @ApiProperty({
    description: "整个文件的hash值",
  })
  @IsString({ message: "文件hash必须是字符型!" })
  file_hash: string;

  /**
   * 切片的hash（切片的索引）
   */
  @ApiProperty({
    description: "切片的hash（切片索引）",
  })
  @IsString({ message: "切片hash必须是字符型!" })
  chunk_hash: string;
}
