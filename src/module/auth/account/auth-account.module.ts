import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountModule } from "@src/module/account/account.module";
import { RoleModule } from "@src/module/account/module/role/role.module";
import { AuthAccountController } from "@src/module/auth/account/controller";
import {
  ApplyRegister,
  ApprovalRegister,
} from "@src/module/auth/account/entity";
import { AuthAccountService } from "@src/module/auth/account/service";
import { EmailModule } from "@src/module/email/email.module";

/**
 * 后台用户登录模块
 */
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
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get("JSON_WEB_TOKEN_ACCOUNT_SECRET"),
          signOptions: {
            expiresIn: configService.get("JSON_WEB_TOKEN_ACCOUNT_TIME"),
          },
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
