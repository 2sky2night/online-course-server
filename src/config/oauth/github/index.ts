import { registerAs } from "@nestjs/config";

/**
 * github第三方登录配置信息
 */
export const githubConfig = registerAs("github", () => {
  return {
    client_id: "ed626ce4c22ba6bb731d",
    client_secret: "76e2337e333a0c006024ccc566ddab2617996ebc",
  };
});
