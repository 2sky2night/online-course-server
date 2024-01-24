import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "@src/module/user/service";
import { UserGuard } from "@src/common/guard";
import { UserToken } from "@src/common/decorator";
import { UpdateUserProfileDto } from "@src/module/user/dto";
import { CommonMessage } from "@src/config/message";

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
