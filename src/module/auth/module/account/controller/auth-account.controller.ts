import { Body, Controller, Inject, Post, UseGuards, Get } from "@nestjs/common";
import { AuthAccountService } from "@src/module/auth/module/account/service";
import {
  LoginAccountDto,
  ApplyAccountDto,
} from "@src/module/auth/module/account/dto";
import { ApprovalAccountDto } from "@src/module/auth/module/account/dto/approval-account.dto";
import { AccountGuard } from "@src/common/guard";
import { AccountToken, Role } from "@src/common/decorator";
import { Roles } from "@src/module/role/enum";
import { RoleGuard } from "@src/common/guard/role.guard";

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
  @UseGuards(AccountGuard, RoleGuard)
  @Role(Roles.SUPER_ADMIN)
  @Post("/approval")
  approval(
    @AccountToken("sub") account_id: number,
    @Body() { apply_id, status }: ApprovalAccountDto,
  ) {
    return this.authAccountService.approval(account_id, apply_id, status);
  }

  /**
   * 测试接口，将废除
   * @param token
   */
  @UseGuards(AccountGuard)
  @Get("/token")
  token(@AccountToken() token) {
    return token;
  }
}
