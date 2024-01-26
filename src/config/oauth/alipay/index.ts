import { registerAs } from "@nestjs/config";

/**
 * 支付宝第三方登录配置信息
 */
export const alipayConfig = registerAs("alipay", () => {
  return {
    app_id: process.env.ALIPAY_APP_ID,
    private_key: process.env.ALIPAY_PRIVATE_KEY,
    alipay_public_key: process.env.ALIPAY_PUBLIC_KEY,
  };
});
