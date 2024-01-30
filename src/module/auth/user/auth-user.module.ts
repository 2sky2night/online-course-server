import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserRegisterType } from "@src/module/auth/user/entity";
import { AuthUserService } from "@src/module/auth/user/service";
import { AuthUserController } from "@src/module/auth/user/controller";
import { UserModule } from "@src/module/user/user.module";
import { AuthUserProvider } from "@src/module/auth/user/auth-user.provider";
import { EmailModule } from "@src/module/email/email.module";

/**
 * 前台用户登录模块
 */
@Module({
  imports: [
    /**
     * 数据库表模块
     */
    TypeOrmModule.forFeature([UserRegisterType]),
    /**
     * jwt模块
     */
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get("JSON_WEB_TOKEN_USER_SECRET"),
          signOptions: {
            expiresIn: configService.get("JSON_WEB_TOKEN_USER_TIME"),
          },
        };
      },
    }),
    /**
     * 用户模块
     */
    UserModule,
    /**
     * 邮箱模块
     */
    EmailModule,
  ],
  controllers: [AuthUserController],
  providers: [AuthUserService, ...AuthUserProvider],
})
export class AuthUserModule {}