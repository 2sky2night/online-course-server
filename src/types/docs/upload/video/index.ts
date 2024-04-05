import { ApiProperty } from "@nestjs/swagger";
import { FileVideo } from "@src/module/file/entity";
import { UploadChunkDto } from "@src/module/upload/module/video/dto";
import { ResponseDto } from "@src/types/docs";
import { FileDto } from "@src/types/docs/file";

// 直接上传视频响应的数据
export class R_UploadVideoDto {
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

// 调用合并文件响应的数据
export class R_MergeChunk {
  @ApiProperty({
    description: "任务id，可以该id来查询任务执行的情况",
  })
  merge_key: string;
}

// 秒传文件响应的数据
export class R_FastUploadDto {
  @ApiProperty({
    description: "文件是否存在",
    example: false,
  })
  done: boolean;

  @ApiProperty({
    description: "提示信息",
    required: false,
  })
  tips?: "秒传失败,文件未上传过!";

  @ApiProperty({
    description: "上传记录id",
    required: false,
  })
  trace_id?: number;

  @ApiProperty({
    description: "文件id",
    required: false,
  })
  file_id?: number;

  @ApiProperty({
    description: "资源路径",
    required: false,
  })
  url?: string;
}

// 查询切片上传的进度响应的数据
export class R_ChunkUploadProgress extends ResponseDto<any> {
  @ApiProperty({
    description: "已经上传的切片索引",
    type: "array",
    items: { type: "number" },
  })
  data: number[];
}

// 获取视频处理进度响应的数据
export class R_GetVideoProcessingProgress {
  @ApiProperty({
    description: "是否处理完成？",
  })
  done: boolean;
  @ApiProperty({
    description: "提示信息",
    required: false,
  })
  tips?: string;
}

// 开始处理视频响应的数据
export class R_ToDoVideoProcessing {
  @ApiProperty({
    description: "处理进度的id",
  })
  processing_key: string;
}

// 获取视频处理进度
export class R_GetVideoMergeProgress {
  @ApiProperty({
    description: "提示信息",
    required: false,
  })
  tips?: string;
  @ApiProperty({
    description: "上传记录id",
    required: false,
  })
  trace_id?: number;
  @ApiProperty({
    description: "文件id",
    required: false,
  })
  file_id?: number;
  @ApiProperty({
    description: "资源路径",
    required: false,
  })
  url?: string;
}

export class FileUploadVideoDto {
  @ApiProperty({ type: "string", format: "binary", description: "文件内容" })
  video: any;
}

export class FileUploadChunkDto extends UploadChunkDto {
  @ApiProperty({ type: "string", format: "binary", description: "切片内容" })
  chunk: any;
}

export class R_GetFileVideos extends FileDto {
  @ApiProperty({ type: [FileVideo] })
  m3u8: FileVideo[];
}
