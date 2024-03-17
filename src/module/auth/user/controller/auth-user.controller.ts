import { Controller, Inject, Body, Post, Get, UseGuards } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { AuthUserService } from "@src/module/auth/user/service";
import { initLoader } from "@src/module/auth/user/init";
import { registerTypeConfig } from "src/config/oauth";
import {
  EmailCodeDto,
  EmailLoginDto,
  OauthLoginDto,
} from "@src/module/auth/user/dto";
import { UserGuard } from "@src/common/guard";
import {
  ApiResponse,
  ApiResponseEmpty,
  UserToken,
} from "@src/common/decorator";
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ResponseDto } from "@src/types/docs";
import { R_LoginUserDto } from "@src/types/docs/auth/user";

@ApiTags("AuthUser")
@ApiBearerAuth()
@ApiExtraModels(ResponseDto)
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
  @ApiOperation({
    summary: "github登录",
    description: "使用github,oauth登录前台应用",
  })
  @ApiResponse(R_LoginUserDto)
  @Post("/login/github")
  githubLogin(@Body() { code }: OauthLoginDto) {
    return this.authUserService.githubLogin(code);
  }

  /**
   * gitee登录
   * @param code 授权码
   */
  @ApiOperation({
    summary: "gitee登录",
    description: "使用gitee,oauth登录前台应用",
  })
  @ApiResponse(R_LoginUserDto)
  @Post("/login/gitee")
  giteeLogin(@Body() { code }: OauthLoginDto) {
    return this.authUserService.giteeLogin(code);
  }

  /**
   * 支付宝登录
   * @param code 授权码
   */
  @ApiOperation({
    summary: "alipay登录",
    description: "使用alipay,oauth登录前台应用",
  })
  @ApiResponse(R_LoginUserDto)
  @Post("/login/alipay")
  alipayLogin(@Body() { code }: OauthLoginDto) {
    return this.authUserService.alipayLogin(code);
  }

  /**
   * 给邮箱发送登录验证码
   * @param email 邮箱地址
   */
  @ApiOperation({
    summary: "获取邮箱登录验证码",
    description: "获取邮箱验证码，登录前台应用",
  })
  @ApiResponseEmpty()
  @Post("/login/email/code")
  generateCode(@Body() { email }: EmailCodeDto) {
    return this.authUserService.sendEmailCode(email);
  }

  /**
   * 邮箱验证码登录
   * @param email 邮箱
   * @param code 验证码
   */
  @ApiOperation({
    summary: "邮箱验证码登录",
    description: "通过邮箱验证码登录前台应用",
  })
  @ApiResponse(R_LoginUserDto)
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
