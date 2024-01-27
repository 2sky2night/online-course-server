import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { UploadImgController } from "@src/module/upload/module/img/upload-img.controller";
import { uploadImgProvider } from "@src/module/upload/module/img/upload-img.provider";
import { UploadImgService } from "@src/module/upload/module/img/upload-img.service";
import { AccountUpload, UserUpload } from "@src/module/upload/entity";
import { UserModule } from "@src/module/user/user.module";
import { AccountModule } from "@src/module/account/account.module";
import { FileModule } from "@src/module/file/file.module";

/**
 * 上传照片模块
 */
@Module({
  imports: [
    /**
     * 数据库表模型
     */
    TypeOrmModule.forFeature([UserUpload, AccountUpload]),
    /**
     * 上传文件模块
     */
    MulterModule.register({ storage: memoryStorage() }),
    /**
     * 前台用户模块
     */
    UserModule,
    /**
     * 后台用户模块
     */
    AccountModule,
    /**
     * 文件模块
     */
    FileModule,
  ],
  controllers: [UploadImgController],
  providers: [...uploadImgProvider, UploadImgService],
})
export class UploadImgModule {}
