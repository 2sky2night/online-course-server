import {
  Controller,
  Patch,
  Body,
  UseGuards,
  Post,
  BadRequestException,
} from "@nestjs/common";
import { AccountService } from "@src/module/account/service";
import { initLoader } from "../init";
import {
  UpdateAccountPasswordDto,
  UpdateAccountProfileDto,
} from "@src/module/account/dto";
import { AccountToken } from "@src/common/decorator";
import { AccountGuard } from "@src/common/guard";
import { CommonMessage } from "@src/config/message";

@Controller("account")
export class AccountController {
  constructor(private accountService: AccountService) {
    // 初始化管理员
    initLoader(this.accountService);
  }

  /**
   * 更新用户信息
   * @param accountId 更新信息的目标账户
   * @param profileDto 更新信息表单
   */
  @UseGuards(AccountGuard)
  @Patch("/profile")
  updateProfile(
    @AccountToken("sub") accountId: number,
    @Body() profileDto: UpdateAccountProfileDto,
  ) {
    const keys = Object.keys(profileDto);
    if (keys.length) {
      if (keys.includes("account_name") || keys.includes("avatar")) {
        return this.accountService.updateProfile(accountId, profileDto);
      } else {
        throw new BadRequestException(CommonMessage.form_fields_error);
      }
    } else {
      throw new BadRequestException(CommonMessage.form_empty_error);
    }
  }

  /**
   * 更新密码
   * @param accountId 更新密码的目标账户
   * @param passwordDto 更新密码表单
   */
  @UseGuards(AccountGuard)
  @Post("/password")
  updatePassword(
    @AccountToken("sub") accountId: number,
    @Body() passwordDto: UpdateAccountPasswordDto,
  ) {
    if (passwordDto.old_password === passwordDto.password) {
      throw new BadRequestException(CommonMessage.password_update_equal_error);
    } else {
      return this.accountService.updatePassword(accountId, passwordDto);
    }
  }
}
