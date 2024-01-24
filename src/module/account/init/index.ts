import { Logger } from "@nestjs/common";
import { AccountService } from "@src/module/account/service";
import { Roles } from "@src/module/account/module/role/enum";
import { once } from "@src/utils/events";
import { ServerMessage } from "@src/config/message";
import { passwordEncrypt } from "@src/utils/crypto";

export function initLoader(accountService: AccountService) {
  once("ROLE_DATA_INIT_DONE", async () => {
    try {
      // 查询超级管理员角色是否存在
      const role = await accountService.roleService.findByName(
        Roles.SUPER_ADMIN,
      );
      if (role) {
        // 查询该账户是否注册了
        const exists = await accountService.findByName(
          process.env.SUPER_ADMIN_NAME,
        );
        if (exists === null) {
          // 注册超级管理员
          await accountService.create(
            process.env.SUPER_ADMIN_NAME,
            passwordEncrypt(process.env.SUPER_ADMIN_PASSWORD),
            process.env.SUPER_ADMIN_EMAIL,
            role.role_id,
          );
          Logger.log(ServerMessage.init_super_admin_success);
        }
      } else {
        Logger.error(ServerMessage.init_role_error + ":角色不存在!");
      }
    } catch (e) {
      Logger.error(`${ServerMessage.init_role_error}:${e.toString()}`);
    }
  });
}
