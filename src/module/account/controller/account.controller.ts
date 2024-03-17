import {
  BadRequestException,
  Body,
  Controller,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { AccountToken, ApiResponseEmpty } from "@src/common/decorator";
import { AccountGuard } from "@src/common/guard";
import { CommonMessage } from "@src/config/message";
import {
  UpdateAccountPasswordDto,
  UpdateAccountProfileDto,
} from "@src/module/account/dto";
import { AccountService } from "@src/module/account/service";
import { ResponseDto } from "@src/types/docs";

import { initLoader } from "../init";

@ApiTags("Account")
@ApiBearerAuth() // 标明此控制器的所有接口需要Bearer类型的token验证
@ApiExtraModels(ResponseDto)
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
  @ApiOperation({
    summary: "更新账户信息",
    description: "后台账户更新个人信息",
  })
  @ApiResponseEmpty()
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
  @ApiOperation({
    summary: "更新账户密码",
    description: "后台账户更新密码",
  })
  @ApiResponseEmpty()
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
