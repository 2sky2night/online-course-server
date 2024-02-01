import { IsString } from "class-validator";

/**
 * 上传进度DTO
 */
export class ChunkProgressDto {
  /**
   * 文件的hash
   */
  @IsString({ message: "文件hash必须是字符型!" })
  file_hash: string;
}
