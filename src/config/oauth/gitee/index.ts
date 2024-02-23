import { registerAs } from "@nestjs/config";
import { readFileData } from "@src/utils/tools";

/**
 * gitee第三方登录配置信息
 */
export const giteeConfig = registerAs("gitee", async () => {
  const client_id = await readFileData(process.env.GITEE_CLIENT_ID_PATH, true);
  const client_secret = await readFileData(
    process.env.GITEE_CLIENT_SECRET_PATH,
    true,
  );
  return {
    client_id,
    client_secret,
    redirect_uri: process.env.GITEE_CALLBACK_URL,
  };
});
