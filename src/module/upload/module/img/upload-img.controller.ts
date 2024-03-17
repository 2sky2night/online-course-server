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
import {
  AccountToken,
  ApiResponse,
  Role,
  UserToken,
} from "@src/common/decorator";
import { FileAvatarPipe, FileCoverPipe, FileImagePipe } from "@src/common/pipe";
import { Roles } from "@src/module/account/module/role/enum";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ResponseDto } from "@src/types/docs";
import {
  FileUploadAvatarDto,
  FileUploadCommentDto,
  FileUploadCoverDto,
  R_UploadImgDto,
} from "@src/types/docs/upload/img";

@ApiTags("UploadImg")
@ApiBearerAuth() // 标明此控制器的所有接口需要Bearer类型的token验证
@ApiExtraModels(ResponseDto)
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
  @ApiOperation({
    summary: "前台用户上传头像",
    description: "前台用户上传头像",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "上传的头像",
    type: FileUploadAvatarDto,
  })
  @ApiResponse(R_UploadImgDto)
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
  @ApiOperation({
    summary: "后台用户上传头像",
    description: "后台用户上传头像",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "上传的头像",
    type: FileUploadAvatarDto,
  })
  @ApiResponse(R_UploadImgDto)
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
  @ApiOperation({
    summary: "后台老师上传视频封面",
    description: "后台老师上传视频封面",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "上传的封面",
    type: FileUploadCoverDto,
  })
  @ApiResponse(R_UploadImgDto)
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
  @ApiOperation({
    summary: "后台老师上传视频合集封面",
    description: "后台老师上传视频合集封面",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "上传的封面",
    type: FileUploadCoverDto,
  })
  @ApiResponse(R_UploadImgDto)
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
  @ApiOperation({
    summary: "前台用户上传评论配图",
    description: "前台用户上传评论配图",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "上传的配图",
    type: FileUploadCommentDto,
  })
  @ApiResponse(R_UploadImgDto)
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
  @ApiOperation({
    summary: "前台用户上传回复配图",
    description: "前台用户上传回复配图",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "上传的配图",
    type: FileUploadCommentDto,
  })
  @ApiResponse(R_UploadImgDto)
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
