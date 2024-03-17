import {
  ResponseAlipayToken,
  ResponseAlipayUser,
} from "@src/lib/oauth/alipay/types";
import AlipaySdk from "alipay-sdk";

/**
 * 支付宝第三方登录封装的API
 */
export class Alipay {
  alipaySdk: AlipaySdk;

  constructor(appId: string, alipayPublicKey: string, privateKey: string) {
    this.alipaySdk = new AlipaySdk({
      appId,
      alipayPublicKey,
      privateKey,
    });
  }

  /**
   * 获取用户的token
   * @param code 授权码
   */
  getToken(code: string): Promise<ResponseAlipayToken> {
    return this.alipaySdk.exec("alipay.system.oauth.token", {
      grant_type: "authorization_code",
      code,
    });
  }

  /**
   * 根据token获取会员信息
   * @param token
   */
  getUserInfo(token: string): Promise<ResponseAlipayUser> {
    return this.alipaySdk.exec("alipay.user.info.share", {
      auth_token: token,
    });
  }
}
