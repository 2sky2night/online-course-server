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
import { AccountGuard, UserGuard } from "@src/common/guard";
import { AccountToken, UserToken } from "@src/common/decorator";
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
  uploadUserAvatar(
    @UserToken("sub") userId: number,
    @UploadedFile(FileAvatarPipe) file: Express.Multer.File,
  ) {
    return this.uploadImgService.uploadUserAvatar(userId, file);
  }

  /**
   * 后台用户上传头像
   * @param accountId 上传者
   * @param file 文件
   */
  @UseGuards(AccountGuard)
  @Post("/avatar/account")
  @UseInterceptors(FileInterceptor("avatar"))
  uploadAccountAvatar(
    @AccountToken("sub") accountId: number,
    @UploadedFile(FileAvatarPipe) file: Express.Multer.File,
  ) {
    return this.uploadImgService.uploadAccountAvatar(accountId, file);
  }
}
