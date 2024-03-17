import { Body, Controller, Get, Inject, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import {
  AccountToken,
  ApiResponse,
  ApiResponseEmpty,
  Role,
} from "@src/common/decorator";
import { AccountGuard, RoleGuard } from "@src/common/guard";
import { Roles } from "@src/module/account/module/role/enum";
import {
  ApplyAccountDto,
  ApprovalAccountDto,
  EmailCodeDto,
  EmailLoginDto,
  LoginAccountDto,
} from "@src/module/auth/account/dto";
import { AuthAccountService } from "@src/module/auth/account/service";
import { ResponseDto } from "@src/types/docs";
import {
  R_ApplyAccountDto,
  R_EmailAccountDto,
  R_LoginAccountDto,
} from "@src/types/docs/auth/account";

@ApiTags("AuthAccount")
@ApiBearerAuth()
@ApiExtraModels(ResponseDto)
@Controller("/auth/account")
export class AuthAccountController {
  /**
   * 鉴权账户服务层
   * @private
   */
  @Inject(AuthAccountService)
  private authAccountService: AuthAccountService;

  /**
   * 登录
   * @param username 用户名
   * @param password 密码
   */
  @ApiOperation({
    summary: "登录",
    description: "登录后台应用",
  })
  @ApiResponse(R_LoginAccountDto)
  @Post("/login")
  login(@Body() { username, password }: LoginAccountDto) {
    return this.authAccountService.login(username, password);
  }

  /**
   * 申请注册
   * @param username 用户名称
   * @param password 用户密码
   * @param email 注册邮箱
   * @param description 注册原因
   * @param role_name 申请的角色
   */
  @ApiOperation({
    summary: "申请注册",
    description: "游客申请注册到后台应用中，只能申请管理员和老师的角色",
  })
  @ApiResponse(R_ApplyAccountDto)
  @Post("/apply")
  async apply(
    @Body()
    { username, password, email, description, role_name }: ApplyAccountDto,
  ) {
    await this.authAccountService.apply(
      username,
      password,
      email,
      description,
      role_name,
    );
    return {
      username,
      email,
      description,
      role_name,
    };
  }

  /**
   * 审批申请注册
   * @param account_id 审批人
   * @param apply_id 申请号
   * @param status 审批状态
   */
  @ApiOperation({
    summary: "审批注册申请",
    description: "超级管理员审批注册申请",
  })
  @UseGuards(AccountGuard, RoleGuard)
  @ApiResponseEmpty()
  @Role(Roles.SUPER_ADMIN)
  @Post("/approval")
  approval(
    @AccountToken("sub") account_id: number,
    @Body() { apply_id, status }: ApprovalAccountDto,
  ) {
    return this.authAccountService.approval(account_id, apply_id, status);
  }

  /**
   * 获取登录验证码
   * @param dto 邮箱
   */
  @ApiOperation({
    summary: "获取邮箱登录验证码",
    description: "登录后台应用时通过邮箱获取验证码",
  })
  @ApiResponseEmpty()
  @Post("/login/email/code")
  getLoginCode(@Body() dto: EmailCodeDto) {
    return this.authAccountService.getLoginCode(dto.email);
  }

  /**
   * 邮箱登录
   * @param dto 表单
   */
  @ApiOperation({
    summary: "邮箱验证码登录",
    description: "邮箱验证码登录后台应用",
  })
  @ApiResponse(R_EmailAccountDto)
  @Post("/login/email")
  emailLogin(@Body() dto: EmailLoginDto) {
    return this.authAccountService.emailLogin(dto.email, dto.code);
  }

  /**
   * 测试接口，将废除
   * @param token
   */
  @UseGuards(AccountGuard)
  @Get("/token")
  token(@AccountToken() token: any) {
    return token;
  }
}
