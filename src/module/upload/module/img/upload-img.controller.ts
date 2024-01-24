import {
  Controller,
  Inject,
  UploadedFile,
  Post,
  UseInterceptors,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadImgService } from "@src/module/upload/module/img/upload-img.service";
import { UserGuard } from "@src/common/guard";
import { UserToken } from "@src/common/decorator";
import { FileAvatarPipe } from "@src/common/pipe";

@Controller("/upload/img")
export class UploadImgController {
  /**
   * 照片上传服务层
   */
  @Inject(UploadImgService)
  uploadImgService: UploadImgService;

  /**
   * 前台用户上传头像
   * @param userId 上传者
   * @param file 文件
   */
  @UseGuards(UserGuard)
  @Post("/avatar/user")
  @UseInterceptors(FileInterceptor("avatar"))
  async uploadUserAvatar(
    @UserToken("sub") userId: number,
    @UploadedFile(FileAvatarPipe) file: Express.Multer.File,
  ) {
    userId;
    file;
    return "ok";
  }
}
