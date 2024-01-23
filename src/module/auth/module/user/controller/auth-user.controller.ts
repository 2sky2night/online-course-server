import { Controller, Inject, Body, Post, Get, UseGuards } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { AuthUserService } from "@src/module/auth/module/user/service";
import { initLoader } from "@src/module/auth/module/user/init";
import { registerTypeConfig } from "src/config/oauth";
import {
  EmailCodeDto,
  EmailLoginDto,
  OauthLoginDto,
} from "@src/module/auth/module/user/dto";
import { UserGuard } from "@src/common/guard";
import { UserToken } from "@src/common/decorator";

@Controller("/auth/user")
export class AuthUserController {
  constructor(
    private authUserService: AuthUserService,
    @Inject(registerTypeConfig.KEY)
    private registerConfig: ConfigType<typeof registerTypeConfig>,
  ) {
    // 初始化创建注册方式
    initLoader(this.authUserService, registerConfig);
  }

  /**
   * github登录
   * @param code 授权码
   */
  @Post("/login/github")
  githubLogin(@Body() { code }: OauthLoginDto) {
    return this.authUserService.githubLogin(code);
  }

  /**
   * gitee登录
   * @param code 授权码
   */
  @Post("/login/gitee")
  giteeLogin(@Body() { code }: OauthLoginDto) {
    return this.authUserService.giteeLogin(code);
  }

  /**
   * 支付宝登录
   * @param code 授权码
   */
  @Post("/login/alipay")
  alipayLogin(@Body() { code }: OauthLoginDto) {
    return this.authUserService.alipayLogin(code);
  }

  /**
   * 给邮箱发送登录验证码
   * @param email 邮箱地址
   */
  @Post("/login/email/code")
  generateCode(@Body() { email }: EmailCodeDto) {
    return this.authUserService.sendEmailCode(email);
  }

  /**
   * 邮箱验证码登录
   * @param email 邮箱
   * @param code 验证码
   */
  @Post("/login/email")
  emailLogin(@Body() { email, code }: EmailLoginDto) {
    return this.authUserService.emailLogin(email, code);
  }

  /**
   * 测试token
   */
  @UseGuards(UserGuard)
  @Get("/token")
  token(@UserToken("sub") uid: number) {
    return uid;
  }
}
