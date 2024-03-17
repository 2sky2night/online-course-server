import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

/**
 * 秒传dto
 */
export class FastUploadDto {
  /**
   * 文件的hash
   */
  @ApiProperty({
    description: "文件hash",
  })
  @IsString({ message: "文件hash必须是字符型!" })
  file_hash: string;
}
