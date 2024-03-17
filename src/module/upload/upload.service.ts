import { Inject, Injectable } from "@nestjs/common";
import { UploadConfig } from "@src/config/upload/types";
import { initLoader } from "@src/module/upload/init";

@Injectable()
export class UploadService {
  constructor(@Inject("UPLOAD_CONFIG") uploadConfig: UploadConfig) {
    initLoader(uploadConfig);
  }
}
