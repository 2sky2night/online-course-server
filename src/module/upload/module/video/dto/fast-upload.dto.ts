import { IsString } from "class-validator";

/**
 * 秒传dto
 */
export class FastUploadDto {
  /**
   * 文件的hash
   */
  @IsString({ message: "文件hash必须是字符型!" })
  file_hash: string;
}
