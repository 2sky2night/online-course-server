import { resolve } from "node:path";
import type { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChunkFolder, Folder } from "@src/lib/folder";
import type { UploadConfig } from "@src/config/upload/types";
import { VideoProcessing } from "@src/lib/video-processing";

export const uploadVideoProvider: Provider[] = [
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
  {
    // 老师上传切片文件目录模块
    provide: "UPLOAD_VIDEO_TEMP",
    inject: [ConfigService],
    useFactory(configService: ConfigService) {
      const config = configService.get<UploadConfig>("upload");
      return new ChunkFolder(
        resolve(config.upload_root_path, `.${config.upload_video_temp_path}`),
        config.upload_video_temp_path,
        resolve(config.upload_root_path, `.${config.upload_video_path}`),
        config.upload_video_path,
      );
    },
  },
  {
    // 对已经合并完成的视频处理的API
    provide: "VIDEO_PROCESSING",
    inject: [ConfigService],
    useFactory(configService: ConfigService) {
      const config = configService.get<UploadConfig>("upload");
      return new VideoProcessing(
        resolve(config.upload_root_path, `.${config.upload_video_path}`),
      );
    },
  },
];
