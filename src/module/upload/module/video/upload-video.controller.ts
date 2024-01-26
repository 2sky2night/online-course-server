import {
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UploadVideoService } from "@src/module/upload/module/video/upload-video.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { AccountGuard, RoleGuard } from "@src/common/guard";
import { AccountToken, Role } from "@src/common/decorator";
import { Roles } from "@src/module/account/module/role/enum";
import { FileVideoPipe } from "@src/common/pipe";

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
}
