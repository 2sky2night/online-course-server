import { registerAs } from "@nestjs/config";

/**
 * gitee第三方登录配置信息
 */
export const giteeConfig = registerAs("gitee", () => {
  return {
    client_id: process.env.GITEE_CLIENT_ID,
    client_secret: process.env.GITEE_CLIENT_SECRET,
    redirect_uri: process.env.GITEE_CALLBACK_URL,
  };
});
