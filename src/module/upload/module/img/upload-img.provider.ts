import { resolve } from "node:path";

import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UploadConfig } from "@src/config/upload/types";
import { Folder } from "@src/lib/folder";

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
  {
    // 后台上传视频封面目录模块
    provide: "UPLOAD_VIDEO_COVER",
    inject: [ConfigService],
    useFactory(configService: ConfigService) {
      const config = configService.get<UploadConfig>("upload");
      return new Folder(
        resolve(config.upload_root_path, `./${config.upload_video_cover_path}`),
        config.upload_video_cover_path,
      );
    },
  },
  {
    // 后台上传视频封面目录模块
    provide: "UPLOAD_VIDEO_COLLECTION_COVER",
    inject: [ConfigService],
    useFactory(configService: ConfigService) {
      const config = configService.get<UploadConfig>("upload");
      return new Folder(
        resolve(
          config.upload_root_path,
          `./${config.upload_video_collection_cover_path}`,
        ),
        config.upload_video_collection_cover_path,
      );
    },
  },
  {
    // 前台上传视频评论配图目录模块
    provide: "UPLOAD_VIDEO_COMMENT",
    inject: [ConfigService],
    useFactory(configService: ConfigService) {
      const config = configService.get<UploadConfig>("upload");
      return new Folder(
        resolve(
          config.upload_root_path,
          `./${config.upload_video_comment_path}`,
        ),
        config.upload_video_comment_path,
      );
    },
  },
  {
    // 前台上传视频回复配图目录模块
    provide: "UPLOAD_VIDEO_REPLY",
    inject: [ConfigService],
    useFactory(configService: ConfigService) {
      const config = configService.get<UploadConfig>("upload");
      return new Folder(
        resolve(config.upload_root_path, `./${config.upload_video_reply_path}`),
        config.upload_video_reply_path,
      );
    },
  },
];
