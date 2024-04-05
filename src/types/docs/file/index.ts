import { ApiProperty } from "@nestjs/swagger";
import { FileType } from "@src/module/file/enum";
import { BaseModel } from "@src/types/docs";

export class FileDto extends BaseModel {
  @ApiProperty({
    description: "文件的id",
  })
  file_id: number;

  @ApiProperty({
    description: "文件的hash",
  })
  hash: string;

  @ApiProperty({
    description: "文件存储的路径",
  })
  file_path: string;

  @ApiProperty({
    description: "文件类型",
    enum: FileType,
    example: FileType.VIDEO,
  })
  file_type: FileType;
}

export class FileVideoDto extends BaseModel {
  @ApiProperty({
    description: "m3u8视频id",
  })
  m3u8_id: number;

  @ApiProperty({
    description: "m3u8视频文件存储的相对路径",
  })
  file_path: string;

  @ApiProperty({
    description: "视频分辨率",
  })
  resolution: number;
}
