import { registerAs } from "@nestjs/config";

/**
 * github第三方登录配置信息
 */
export const githubConfig = registerAs("github", () => {
  return {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
  };
});
