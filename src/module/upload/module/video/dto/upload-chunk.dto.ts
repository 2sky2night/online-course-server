import { IsString } from "class-validator";

/**
 * 上传切片的DTO
 */
export class UploadChunkDto {
  /**
   * 文件的hash
   */
  @IsString({ message: "文件hash必须是字符型!" })
  file_hash: string;
  /**
   * 切片的hash（切片的索引）
   */
  @IsString({ message: "切片hash必须是字符型!" })
  chunk_hash: string;
}
