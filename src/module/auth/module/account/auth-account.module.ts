import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { AuthAccountController } from "@src/module/auth/module/account/controller";
import { AccountModule } from "@src/module/account/account.module";
import { AuthAccountService } from "@src/module/auth/module/account/service";
import { RoleModule } from "@src/module/role/role.module";
import {
  ApplyRegister,
  ApprovalRegister,
} from "@src/module/auth/module/account/entity";
import { EmailModule } from "@src/module/email/email.module";

@Module({
  imports: [
    /**
     * 注入数据库模型
     */
    TypeOrmModule.forFeature([ApprovalRegister, ApplyRegister]),
    /**
     * 注入jwt，由于使用环境变量，需要异步注入
     */
    JwtModule.registerAsync({
      useFactory() {
        return {
          secret: process.env.JSON_WEB_TOKEN_ACCOUNT_SECRET,
          signOptions: { expiresIn: process.env.JSON_WEB_TOKEN_ACCOUNT_TIME },
        };
      },
    }),
    /**
     * 账户模块
     */
    AccountModule,
    /**
     * 角色模块
     */
    RoleModule,
    /**
     * 邮箱模块
     */
    EmailModule,
  ],
  controllers: [AuthAccountController],
  providers: [AuthAccountService],
})
export class AuthAccountModule {}
