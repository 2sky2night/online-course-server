import { AuthUserService } from "@src/module/auth/module/user/service";
import { Logger } from "@nestjs/common";
import { ServerMessage } from "@src/config/message";

/**
 * 初始化创建注册方式
 * @param authUserService
 * @param registerTypes
 */
export const initLoader = (
  authUserService: AuthUserService,
  registerTypes: string[],
) => {
  return Promise.all(
    registerTypes.map(async (name) => {
      // 查询此平台是否已经创建过了
      try {
        const exists = await authUserService.findByName(name);
        if (exists) {
          // 已经创建过了就跳过创建
          return Promise.resolve();
        } else {
          // 未创建则创建此注册方式
          const item = await authUserService.create(name);
          return Promise.resolve(item);
        }
      } catch (error) {
        return Promise.reject(error);
      }
    }),
  )
    .then((list) => {
      if (list.some((item) => item)) {
        Logger.log(ServerMessage.init_register_type_success);
      }
    })
    .catch((error) => {
      Logger.error(
        `${ServerMessage.init_register_type_error}:${error.toString()}`,
      );
    });
};
