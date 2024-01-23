import { registerAs } from "@nestjs/config";
import { giteeConfig } from "@src/config/oauth/gitee";
import { githubConfig } from "@src/config/oauth/github";
import { alipayConfig } from "@src/config/oauth/alipay";

/**
 * 前台所有的注册方式
 */
export enum RegisterType {
  GITHUB = "github",
  ALIPAY = "alipay",
  GITEE = "gitee",
  EMAIL = "email",
}

/**
 * 所有的注册方式
 */
export const registerTypeConfig = registerAs("register-type", () => {
  return [
    RegisterType.GITHUB,
    RegisterType.ALIPAY,
    RegisterType.GITEE,
    RegisterType.EMAIL,
  ];
});

export default [giteeConfig, githubConfig, alipayConfig, registerTypeConfig];
