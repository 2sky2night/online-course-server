import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { UploadImgController } from "@src/module/upload/module/img/upload-img.controller";
import { uploadImgProvider } from "@src/module/upload/module/img/upload-img.provider";
import { UploadImgService } from "@src/module/upload/module/img/upload-img.service";
import { AccountUpload, UserUpload } from "@src/module/upload/entity";

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
  ],
  controllers: [UploadImgController],
  providers: [...uploadImgProvider, UploadImgService],
})
export class UploadImgModule {}
