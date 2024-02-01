import { IsNumber, IsString, Min } from "class-validator";

/**
 * 合并切片
 */
export class MergeChunkDto {
  /**
   * 文件的hash
   */
  @IsString({ message: "文件hash必须是字符型!" })
  file_hash: string;
  /**
   * 切片数量，用来校验
   */
  @IsNumber({}, { message: "切片数量必须是数值型" })
  @Min(1, { message: "切片数量必须大于等于1！" })
  chunk_count: number;
}
