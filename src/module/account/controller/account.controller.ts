import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
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
  ApiResponsePage,
  Role,
} from "@src/common/decorator";
import { AccountGuard, RoleGuard } from "@src/common/guard";
import { BooleanPipe, LimitPipe, OffsetPipe } from "@src/common/pipe";
import { CommonMessage } from "@src/config/message";
import {
  UpdateAccountPasswordDto,
  UpdateAccountProfileDto,
} from "@src/module/account/dto";
import { Roles } from "@src/module/account/module/role/enum";
import { AccountService } from "@src/module/account/service";
import { ResponseDto } from "@src/types/docs";
import { AccountInfoDto } from "@src/types/docs/account";

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

  /**
   * 查询后台所有用户
   * @param offset
   * @param limit
   * @param desc
   */
  @ApiOperation({
    summary: "查询后台所有用户",
    description: "查询后台所有用户",
  })
  @ApiResponsePage(AccountInfoDto)
  @Role(Roles.SUPER_ADMIN)
  @UseGuards(AccountGuard, RoleGuard)
  @Get("/list")
  list(
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.accountService.list(offset, limit, desc);
  }

  @ApiOperation({
    summary: "后台账户获取个人信息",
    description: "根据token获取个人信息",
  })
  @ApiResponse(AccountInfoDto)
  @UseGuards(AccountGuard)
  @Get("/info")
  getInfoByToken(@AccountToken("sub") accountId: number) {
    return this.accountService.getAccountInfo(accountId);
  }
}
