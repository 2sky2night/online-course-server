import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UploadConfig } from "@src/config/upload/types";
import { FfmpegFolder, Folder } from "@src/lib/folder";
import { resolve } from "node:path";

export const VideoProvider: Provider[] = [
  {
    // 自动生成视频封面目录模块
    provide: "AUTO_VIDEO_COVER",
    inject: [ConfigService],
    useFactory(configService: ConfigService) {
      const config = configService.get<UploadConfig>("upload");
      return new FfmpegFolder(
        resolve(config.upload_root_path, `./${config.auto_video_cover_path}`),
        config.auto_video_cover_path,
      );
    },
  },
  {
    // 老师上传视频目录模块
    provide: "UPLOAD_VIDEO",
    inject: [ConfigService],
    useFactory(configService: ConfigService) {
      const config = configService.get<UploadConfig>("upload");
      return new Folder(
        resolve(config.upload_root_path, `.${config.upload_video_path}`),
        config.upload_video_path,
      );
    },
  },
];
