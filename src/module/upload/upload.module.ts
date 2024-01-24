import { Module } from "@nestjs/common";
import { UploadImgModule } from "@src/module/upload/module/img/upload-img.module";
import { uploadProvider } from "@src/module/upload/upload.provider";
import { UploadService } from "@src/module/upload/upload.service";

@Module({
  imports: [UploadImgModule],
  providers: [...uploadProvider, UploadService],
})
export class UploadModule {}
