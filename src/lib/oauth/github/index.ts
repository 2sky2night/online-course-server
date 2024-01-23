import { Agent } from "node:https";
import axios from "axios";
import type {
  ResponseGithubToken,
  ResponseGithubUser,
} from "@src/lib/oauth/github/types";

/**
 * Github第三方登录封装的API
 */
export class Github {
  /**
   * 客户端id
   */
  client_id: string;
  /**
   * 客户端密钥
   */
  client_secret: string;
  /**
   * 创建一个自定义的httpsAgent，忽略SSL证书验证
   */
  agent: Agent;
  /**
   * 用户代理
   */
  userAgent: string;

  /**
   * 初始化Github登录实例
   * @param client_id 客户端id
   * @param client_secret 客户端密钥
   */
  constructor(client_id: string, client_secret: string) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.agent = new Agent({ rejectUnauthorized: false });
    this.userAgent =
      "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0";
  }

  /**
   * 获取用户token
   * @param code 授权码
   */
  getToken(code: string) {
    const url = `https://github.com/login/oauth/access_token?code=${code}&client_id=${this.client_id}&client_secret=${this.client_secret}`;
    return axios.post<ResponseGithubToken>(
      url,
      {},
      {
        httpsAgent: this.agent,
        headers: {
          accept: "application/json",
          // 必要的请求头部，否则github不准调用此接口
          "user-agent": this.userAgent,
        },
      },
    );
  }

  /**
   * 获取用户的基础信息
   * @param token 用户的token
   */
  getUserInfo(token: string) {
    return axios.get<ResponseGithubUser>("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        // 必要的请求头部，否则github不准调用此接口
        "user-agent": this.userAgent,
      },
      httpsAgent: this.agent,
    });
  }
}
