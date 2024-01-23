import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Github } from "@src/lib/oauth";
import { Gitee } from "@src/lib/oauth/gitee";
import { Alipay } from "@src/lib/oauth/alipay";

export const AuthUserProvider: Provider[] = [
  {
    provide: "GITHUB_OAUTH",
    inject: [ConfigService],
    useFactory(configService: ConfigService) {
      return new Github(
        configService.get("github.client_id"),
        configService.get("github.client_secret"),
      );
    },
  },
  {
    provide: "GITEE_OAUTH",
    inject: [ConfigService],
    useFactory(configService: ConfigService) {
      return new Gitee(
        configService.get("gitee.client_id"),
        configService.get("gitee.client_secret"),
        configService.get("gitee.redirect_uri"),
      );
    },
  },
  {
    provide: "ALIPAY_OAUTH",
    inject: [ConfigService],
    useFactory(configService: ConfigService) {
      return new Alipay(
        configService.get("alipay.app_id"),
        configService.get("alipay.alipay_public_key"),
        configService.get("alipay.private_key"),
      );
    },
  },
];
