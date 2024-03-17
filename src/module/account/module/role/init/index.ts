import { Logger } from "@nestjs/common";
import { ServerMessage } from "@src/config/message";
import { emit } from "@src/utils/events";

import { Roles } from "../enum";
import { RoleService } from "../service";

/**
 * 初始化时创建超级管理员、管理员、老师三个初始用户
 * @param roleService
 */
export function initLoader(roleService: RoleService) {
  return Promise.all(
    [Roles.SUPER_ADMIN, Roles.ADMIN, Roles.TEACHER].map(async (role_name) => {
      const exists = await roleService.findByName(role_name);
      if (exists === null) {
        // 不存在，则创建角色
        return roleService.create(role_name);
      } else {
        // 存在
        return Promise.resolve();
      }
    }),
  )
    .then((r) => {
      if (r.every((item) => item)) {
        Logger.log(ServerMessage.init_role_success);
      }
      // 创建成功，通知account模块创建超级管理员
      emit("ROLE_DATA_INIT_DONE");
    })
    .catch((error) => {
      Logger.error(`${ServerMessage.init_role_error}:${error.toString()}`);
    });
}
