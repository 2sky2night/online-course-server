import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Patch,
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
  ApiResponse,
  ApiResponseEmpty,
  ApiResponsePage,
  Role,
  UserToken,
} from "@src/common/decorator";
import { AccountGuard, RoleGuard, UserGuard } from "@src/common/guard";
import { BooleanPipe, LimitPipe, OffsetPipe } from "@src/common/pipe";
import { CommonMessage } from "@src/config/message";
import { Roles } from "@src/module/account/module/role/enum";
import { UpdateUserProfileDto } from "@src/module/user/dto";
import { UserService } from "@src/module/user/service";
import { ResponseDto } from "@src/types/docs";
import { UserInfoDto } from "@src/types/docs/user";

@ApiTags("User")
@ApiBearerAuth() // 标明此控制器的所有接口需要Bearer类型的token验证
@ApiExtraModels(ResponseDto)
@Controller("user")
export class UserController {
  /**
   * 用户服务层
   */
  @Inject(UserService)
  userService: UserService;

  /**
   * 更新用户信息
   * @param userId 用户id
   * @param profileDto 更新表单
   */
  @ApiOperation({
    summary: "更新用户信息",
    description: "前台用户更新个人信息",
  })
  @ApiResponseEmpty()
  @UseGuards(UserGuard)
  @Patch("/profile")
  updateProfile(
    @UserToken("sub") userId: number,
    @Body() profileDto: UpdateUserProfileDto,
  ) {
    const keys = Object.keys(profileDto);
    if (keys.length) {
      if (
        keys.includes("user_name") ||
        keys.includes("avatar") ||
        keys.includes("gender") ||
        keys.includes("age")
      ) {
        return this.userService.updateProfile(userId, profileDto);
      } else {
        throw new BadRequestException(CommonMessage.form_fields_error);
      }
    } else {
      throw new BadRequestException(CommonMessage.form_empty_error);
    }
  }

  /**
   * 查询前台所有用户
   * @param offset
   * @param limit
   * @param desc
   */
  @ApiOperation({
    summary: "查询前台所有用户",
    description: "查询前台所有用户",
  })
  @ApiResponsePage(UserInfoDto)
  @Role(Roles.SUPER_ADMIN)
  @UseGuards(AccountGuard, RoleGuard)
  @Get("/list")
  list(
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.userService.list(offset, limit, desc);
  }

  @ApiOperation({
    summary: "获取用户信息",
    description: "根据token获取用户信息",
  })
  @ApiResponse(UserInfoDto)
  @UseGuards(UserGuard)
  @Get("/info")
  info(@UserToken("sub") user_id: number) {
    return this.userService.info(user_id);
  }
}
