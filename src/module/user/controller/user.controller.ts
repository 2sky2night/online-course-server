import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Patch,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ApiResponseEmpty, UserToken } from "@src/common/decorator";
import { UserGuard } from "@src/common/guard";
import { CommonMessage } from "@src/config/message";
import { UpdateUserProfileDto } from "@src/module/user/dto";
import { UserService } from "@src/module/user/service";
import { ResponseDto } from "@src/types/docs";

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
}
