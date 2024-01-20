import { Module } from "@nestjs/common";
import { AuthAccountModule } from "@src/module/auth/module/account/auth-account.module";
import { AuthUserModule } from "@src/module/auth/module/user/auth-user.module";

@Module({
  imports: [
    /**
     * 后台账户模块
     */
    AuthAccountModule,
    /**
     * 前台用户模块
     */
    AuthUserModule,
  ],
})
export class AuthModule {}
