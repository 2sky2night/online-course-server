import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UploadVideoService } from "@src/module/upload/module/video/upload-video.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { AccountGuard, RoleGuard } from "@src/common/guard";
import {
  AccountToken,
  ApiResponse,
  ApiResponseEmpty,
  Role,
} from "@src/common/decorator";
import { Roles } from "@src/module/account/module/role/enum";
import { FileChunkPipe, FileVideoPipe } from "@src/common/pipe";
import {
  FastUploadDto,
  MergeChunkDto,
  UploadChunkDto,
  ChunkProgressDto,
} from "@src/module/upload/module/video/dto";
import { UploadMessage } from "@src/config/message";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
  ApiResponse as ApiResponseRaw,
} from "@nestjs/swagger";
import { ResponseDto } from "@src/types/docs";
import {
  FileUploadChunkDto,
  FileUploadVideoDto,
  R_ChunkUploadProgress,
  R_FastUploadDto,
  R_GetVideoMergeProgress,
  R_GetVideoProcessingProgress,
  R_MergeChunk,
  R_ToDoVideoProcessing,
  R_UploadVideoDto,
} from "@src/types/docs/upload/video";

@ApiTags("UploadVideo")
@ApiBearerAuth() // 标明此控制器的所有接口需要Bearer类型的token验证
@ApiExtraModels(ResponseDto)
@Controller("/upload/video")
export class UploadVideoController {
  /**
   * 上传视频服务层
   */
  @Inject(UploadVideoService)
  uploadVideoService: UploadVideoService;

  /**
   * 老师上传视频（直接上传）
   * @param accountId 上传
   * @param file 上传的文件
   * @deprecated
   */
  @ApiOperation({
    summary: "老师直接上传视频",
    description: "老师直接上传视频",
    deprecated: true,
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "上传的完整视频",
    type: FileUploadVideoDto,
  })
  @ApiResponse(R_UploadVideoDto)
  @Post()
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  @UseInterceptors(FileInterceptor("video"))
  uploadVideo(
    @AccountToken("sub") accountId: number,
    @UploadedFile(FileVideoPipe)
    file: Express.Multer.File,
  ) {
    return this.uploadVideoService.uploadVideo(accountId, file);
  }

  /**
   * 上传切片文件
   * @param chunkDto 切片信息
   * @param file 文件
   */
  @ApiOperation({
    summary: "老师切片上传视频文件",
    description: "老师切片上传视频文件",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "上传的切片视频文件",
    type: FileUploadChunkDto,
  })
  @ApiResponseEmpty()
  @Post("/chunk")
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  @UseInterceptors(FileInterceptor("chunk"))
  uploadChunk(
    @Body() chunkDto: UploadChunkDto,
    @UploadedFile(FileChunkPipe)
    file: Express.Multer.File,
  ) {
    if (Number.isNaN(+chunkDto.chunk_hash) || Number(chunkDto.chunk_hash) < 0) {
      // 校验切片hash
      throw new BadRequestException(UploadMessage.chunk_hash_error);
    }
    return this.uploadVideoService.uploadChunk(
      chunkDto.file_hash,
      chunkDto.chunk_hash,
      file.buffer,
    );
  }

  /**
   * 开始合并切片
   * @param accountId 上传者
   * @param dto 文件信息表单
   */
  @ApiOperation({
    summary: "开始执行合并切片文件任务",
    description: "开启执行合并切片文件的任务，通过返回的key来查询合并进度",
  })
  @ApiResponse(R_MergeChunk)
  @Post("/chunk/merge")
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  mergeChunk(
    @AccountToken("sub") accountId: number,
    @Body() dto: MergeChunkDto,
  ) {
    return this.uploadVideoService.toDoMergeChunk(
      accountId,
      dto.file_hash,
      dto.chunk_count,
    );
  }

  /**
   * 秒传
   * @param accountId 账户id
   * @param dto 表单
   */
  @ApiOperation({
    summary: "秒传",
    description: "上传文件hash，检查是否上传过",
  })
  @ApiResponse(R_FastUploadDto)
  @Post("/fast")
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  fastUpload(
    @AccountToken("sub") accountId: number,
    @Body() dto: FastUploadDto,
  ) {
    return this.uploadVideoService.fastUpload(accountId, dto.file_hash);
  }

  /**
   * 获取切片上传进度
   * @param dto 表单
   */
  @ApiOperation({
    summary: "获取当前文件上传了多少切片了",
    description: "获取当前文件上传了多少切片了，返回已经上传成功的切片索引",
  })
  @ApiResponseRaw({
    description: "已经上传成功的切片索引",
    type: R_ChunkUploadProgress,
  })
  @Post("/chunk/progress")
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  chunkUploadProgress(@Body() dto: ChunkProgressDto) {
    return this.uploadVideoService.chunkUploadProgress(dto.file_hash);
  }

  /**
   * 获取视频处理进度
   * @param processingKey 要查询的视频处理信息键
   */
  @ApiOperation({
    summary: "获取视频处理进度",
    description: "获取视频处理进度",
  })
  @ApiResponse(R_GetVideoProcessingProgress)
  @Get("/processing")
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  getVideoProcessingProgress(@Query("processing_key") processingKey: string) {
    if (!processingKey.length)
      throw new BadRequestException(UploadMessage.get_video_processing_error);
    return this.uploadVideoService.getVideoProcessingProgress(processingKey);
  }

  /**
   * 对源视频进行处理
   * @param file_id 文件id
   * @param account_id 账户id
   */
  @ApiOperation({
    summary: "开始执行处理视频的任务",
    description: "开始执行处理视频的任务，返回处理进度的id可以轮询处理进度",
  })
  @ApiResponse(R_ToDoVideoProcessing)
  @Post("/processing/:fid")
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  toDoVideoProcessing(
    @Param("fid") file_id: number,
    @AccountToken("sub") account_id: number,
  ) {
    return this.uploadVideoService.toDoVideoProcessing(file_id, account_id);
  }

  /**
   * 获取视频合并进度
   * @param mergeKey 合并进度
   */
  @ApiOperation({
    summary: "获取视频合并进度",
    description: "获取视频合并的进度",
  })
  @ApiResponse(R_GetVideoMergeProgress)
  @Get("/chunk/merge")
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard, RoleGuard)
  getVideoMergeProgress(@Query("merge_key") mergeKey: string) {
    return this.uploadVideoService.getVideoMergeProgress(mergeKey);
  }
}
