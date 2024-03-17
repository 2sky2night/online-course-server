import { Controller } from "@nestjs/common";

import { initLoader } from "../init";
import { RoleService } from "../service";

@Controller("role")
export class RoleController {
  constructor(private roleService: RoleService) {
    // 初始化三个角色
    initLoader(this.roleService);
  }
}
