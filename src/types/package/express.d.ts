declare namespace Express {
  export interface Request {
    /**
     * 从账户token中解析出来的数据（后台）
     */
    account_token?: {
      /**
       * 账户id
       */
      sub: number;
      role_name: "Teacher" | "Admin" | "SuperAdmin";
    };
    /**
     * 从用户token中解析出来的数据（前台）
     */
    user_token?: {
      /**
       * 用户id
       */
      sub: number;
    };
  }
}
