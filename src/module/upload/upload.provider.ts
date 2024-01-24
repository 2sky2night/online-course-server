import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * 上传提供者
 */
export const uploadProvider: Provider[] = [
  {
    provide: "UPLOAD_CONFIG",
    inject: [ConfigService],
    useFactory(configService: ConfigService) {
      return configService.get("upload");
    },
  },
];
