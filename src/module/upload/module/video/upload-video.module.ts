import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountModule } from "@src/module/account/account.module";
import { FileModule } from "@src/module/file/file.module";
import { AccountUpload } from "@src/module/upload/entity";
import { UploadVideoController } from "@src/module/upload/module/video/upload-video.controller";
import { uploadVideoProvider } from "@src/module/upload/module/video/upload-video.provider";
import { UploadVideoService } from "@src/module/upload/module/video/upload-video.service";
import { memoryStorage } from "multer";

/**
 * 上传视频模块
 */
@Module({
  imports: [
    /**
     * 数据库表模型
     */
    TypeOrmModule.forFeature([AccountUpload]),
    /**
     * 上传文件模块
     */
    MulterModule.register({ storage: memoryStorage() }),
    /**
     * 后台账户模块
     */
    AccountModule,
    /**
     * 文件模块
     */
    FileModule,
  ],
  controllers: [UploadVideoController],
  providers: [...uploadVideoProvider, UploadVideoService],
  exports: [UploadVideoService],
})
export class UploadVideoModule {}
