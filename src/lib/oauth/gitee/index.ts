import { Agent } from "node:https";

import {
  ResponseGiteeToken,
  ResponseGiteeUser,
} from "@src/lib/oauth/gitee/types";
import axios from "axios";

/**
 * Gitee第三方登录封装的API
 */
export class Gitee {
  /**
   * 客户端id
   */
  client_id: string;
  /**
   * 客户端密钥
   */
  client_secret: string;
  /**
   * 回调地址
   */
  redirect_uri: string;
  /**
   * https代理
   */
  agent: Agent;
  /**
   * 用户代理
   */
  userAgent: string;

  /**
   * 初始化
   * @param client_id 客户端id
   * @param client_secret 客户端密钥
   * @param redirect_uri 回调地址
   */
  constructor(client_id: string, client_secret: string, redirect_uri: string) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.redirect_uri = redirect_uri;
    this.agent = new Agent({ rejectUnauthorized: false });
    this.userAgent =
      "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0";
  }

  /**
   * 获取用户token
   * @param code 授权码
   */
  getToken(code: string) {
    const url = `https://gitee.com/oauth/token?grant_type=authorization_code&code=${code}&client_id=${this.client_id}&redirect_uri=${this.redirect_uri}&client_secret=${this.client_secret}`;
    return axios.post<ResponseGiteeToken>(
      url,
      {},
      {
        headers: {
          "user-agent": this.userAgent,
        },
        httpsAgent: this.agent,
      },
    );
  }

  /**
   * 通过token获取用户信息
   * @param token 用户身份令牌
   */
  getUserInfo(token: string) {
    return axios.get<ResponseGiteeUser>("https://gitee.com/api/v5/user", {
      headers: {
        "user-agent": this.userAgent,
        Authorization: `Bearer ${token}`,
      },
      httpsAgent: this.agent,
    });
  }
}
