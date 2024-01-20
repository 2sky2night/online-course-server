declare namespace Express {
  export interface Request {
    /**
     * 从账户token中解析出来的数据
     */
    account_token?: {
      sub: number;
      role_name: "Teacher" | "Admin" | "SuperAdmin";
    };
  }
}
