import { registerAs } from "@nestjs/config";
import { readFileData } from "@src/utils/tools";

/**
 * github第三方登录配置信息
 */
export const githubConfig = registerAs("github", async () => {
  const client_id = await readFileData(process.env.GITHUB_CLIENT_ID_PATH, true);
  const client_secret = await readFileData(
    process.env.GITHUB_CLIENT_SECRET_PATH,
    true,
  );
  return {
    client_id,
    client_secret,
  };
});
