import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UploadConfig } from "@src/config/upload/types";
import { Folder } from "@src/lib/folder";

/**
 * 图片上传提供者
 */
export const uploadImgProvider: Provider[] = [
  {
    provide: "UPLOAD_USER_AVATAR",
    inject: [ConfigService],
    useFactory(configService: ConfigService) {
      const config = configService.get<UploadConfig>("upload");
      return new Folder(config.upload_user_avatar_path);
    },
  },
];
