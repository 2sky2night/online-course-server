/**
 * 获取gitee授权用户的Token
 */
export interface ResponseGiteeToken {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: string;
}

export interface ResponseGiteeUser {
  /**
   * 用户id
   */
  id: number;
  /**
   * 用户名称
   */
  login: string;
  name: string;
  /**
   * 用户头像
   */
  avatar_url: string;
  url: string;
  html_url: string;
  remark: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  blog?: any;
  weibo?: any;
  bio?: any;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  stared: number;
  watched: number;
  created_at: string;
  updated_at: string;
  email: string | null;
}
