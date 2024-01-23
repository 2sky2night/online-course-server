import { registerAs } from "@nestjs/config";

/**
 * gitee第三方登录配置信息
 */
export const giteeConfig = registerAs("gitee", () => {
  return {
    client_id:
      "61b9b924a7a34166adfd64861eb852230d3bc846056d768d969c8f7af6d01997",
    client_secret:
      "6f9dbe6d57fea645dd240e5c5ae7c535449620721e6ddf4bdf17f365a842fa32",
    // 回调地址，若与申请时填写的地址不一样会导致调用API失败
    redirect_uri: "http://localhost:5173/oauth/gitee",
  };
});
