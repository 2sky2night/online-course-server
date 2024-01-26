import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UploadConfig } from "@src/config/upload/types";
import { Folder } from "@src/lib/folder";
import { resolve } from "node:path";

/**
 * 图片上传提供者
 */
export const uploadImgProvider: Provider[] = [
  {
    // 上传前台用户头像目录模块
    provide: "UPLOAD_USER_AVATAR",
    inject: [ConfigService],
    useFactory(configService: ConfigService) {
      const config = configService.get<UploadConfig>("upload");
      return new Folder(
        resolve(config.upload_root_path, `./${config.upload_user_avatar_path}`),
        config.upload_user_avatar_path,
      );
    },
  },
  {
    // 上传后台用户头像目录模块
    provide: "UPLOAD_ACCOUNT_AVATAR",
    inject: [ConfigService],
    useFactory(configService: ConfigService) {
      const config = configService.get<UploadConfig>("upload");
      return new Folder(
        resolve(
          config.upload_root_path,
          `./${config.upload_account_avatar_path}`,
        ),
        config.upload_account_avatar_path,
      );
    },
  },
];
