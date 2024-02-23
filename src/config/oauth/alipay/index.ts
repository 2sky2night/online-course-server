import { registerAs } from "@nestjs/config";
import { readFileData } from "@src/utils/tools";

/**
 * 支付宝第三方登录配置信息
 */
export const alipayConfig = registerAs("alipay", async () => {
  const app_id = await readFileData(process.env.ALIPAY_APP_ID_PATH, true);
  const private_key = await readFileData(
    process.env.ALIPAY_PRIVATE_KEY_PATH,
    true,
  );
  const alipay_public_key = await readFileData(
    process.env.ALIPAY_PUBLIC_KEY_PATH,
    true,
  );
  return {
    app_id,
    private_key,
    alipay_public_key,
  };
});
