/**
 * 获取授权用户的token
 */
export interface ResponseAlipayToken {
  accessToken: string;
  authStart: string;
  expiresIn: number;
  reExpiresIn: number;
  refreshToken: string;
  openId: string;
  traceId: string;
}

/**
 * 根据token获取用户信息
 */
export interface ResponseAlipayUser {
  code: string;
  msg: string;
  /**
   * 头像（可能不会有此选项，做好容错）
   */
  avatar: string | undefined;
  /**
   * 昵称（可能不会有此选项，做好容错）
   */
  nickName: string | undefined;
  /**
   * 用户id
   */
  openId: string;
  traceId: string;
}
