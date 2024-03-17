import { Module } from "@nestjs/common";
import { UploadImgModule } from "@src/module/upload/module/img/upload-img.module";
import { UploadVideoModule } from "@src/module/upload/module/video/upload-video.module";
import { uploadProvider } from "@src/module/upload/upload.provider";
import { UploadService } from "@src/module/upload/upload.service";

/**
 * 上传模块
 */
@Module({
  imports: [
    /**
     * 上传图片模块
     */
    UploadImgModule,
    /**
     * 上传视频模块
     */
    UploadVideoModule,
  ],
  providers: [...uploadProvider, UploadService],
})
export class UploadModule {}
