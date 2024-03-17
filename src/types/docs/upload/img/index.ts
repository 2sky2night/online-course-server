import { ApiProperty } from "@nestjs/swagger";

export class R_UploadImgDto {
  @ApiProperty({
    description: "上传记录id",
  })
  trace_id: number;
  @ApiProperty({
    description: "文件id",
  })
  file_id: number;
  @ApiProperty({
    description: "资源路径",
  })
  url: string;
}

export class FileUploadAvatarDto {
  @ApiProperty({ type: "string", format: "binary", description: "文件内容" })
  avatar: any;
}

export class FileUploadCoverDto {
  @ApiProperty({ type: "string", format: "binary", description: "文件内容" })
  cover: any;
}

export class FileUploadCommentDto {
  @ApiProperty({ type: "string", format: "binary", description: "文件内容" })
  image: any;
}
