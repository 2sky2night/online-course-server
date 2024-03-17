import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { readFileData } from "@src/utils/tools";
import { createTransport } from "nodemailer";

/**
 * EMAIL模块的提供者
 */
export const emailProvider: Provider[] = [
  {
    provide: "EMAIL_TRANSPORT",
    inject: [ConfigService],
    async useFactory(configService: ConfigService) {
      const pass = await readFileData(
        configService.get("EMAIL_KEY_PATH"),
        true,
      );
      return createTransport({
        // 默认支持的邮箱服务包括：”QQ”、”163”、”126”、”iCloud”、”Hotmail”、”Yahoo”等
        service: "QQ",
        auth: {
          // 发件人邮箱账号
          user: process.env.EMAIL_LOCATION,
          //发件人邮箱的授权码 需要在自己的邮箱设置中生成,并不是邮件的登录密码
          pass,
        },
      });
    },
  },
];
