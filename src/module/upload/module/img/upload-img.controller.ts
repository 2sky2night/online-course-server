import {
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadImgService } from "@src/module/upload/module/img/upload-img.service";
import { AccountGuard, UserGuard } from "@src/common/guard";
import { AccountToken, Role, UserToken } from "@src/common/decorator";
import { FileAvatarPipe, FileCoverPipe, FileImagePipe } from "@src/common/pipe";
import { Roles } from "@src/module/account/module/role/enum";

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

  /**
   * 老师上传视频封面
   * @param accountId 上传者
   * @param file 老师
   */
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard)
  @UseInterceptors(FileInterceptor("cover"))
  @Post("/video/cover")
  uploadVideoCover(
    @AccountToken("sub") accountId: number,
    @UploadedFile(FileCoverPipe) file: Express.Multer.File,
  ) {
    return this.uploadImgService.uploadVideoCover(accountId, file);
  }

  /**
   * 老师上传视频合集封面
   * @param accountId 账户id
   * @param file 文件
   */
  @Role(Roles.TEACHER)
  @UseGuards(AccountGuard)
  @UseInterceptors(FileInterceptor("cover"))
  @Post("/video/collection/cover")
  uploadVideoCollectionCover(
    @AccountToken("sub") accountId: number,
    @UploadedFile(FileCoverPipe) file: Express.Multer.File,
  ) {
    return this.uploadImgService.uploadVideoCollectionCover(accountId, file);
  }

  /**
   * 上传视频评论配图
   * @param userId 用户id
   * @param file 文件
   */
  @Post("/video/comment")
  @UseGuards(UserGuard)
  @UseInterceptors(FileInterceptor("image"))
  uploadVideoComment(
    @UserToken("sub") userId: number,
    @UploadedFile(FileImagePipe) file: Express.Multer.File,
  ) {
    return this.uploadImgService.uploadVideoComment(userId, file);
  }

  /**
   * 上传视频回复配图
   * @param userId 用户id
   * @param file 文件
   */
  @Post("/video/reply")
  @UseGuards(UserGuard)
  @UseInterceptors(FileInterceptor("image"))
  uploadVideoReply(
    @UserToken("sub") userId: number,
    @UploadedFile(FileImagePipe) file: Express.Multer.File,
  ) {
    return this.uploadImgService.uploadVideoReply(userId, file);
  }
}
