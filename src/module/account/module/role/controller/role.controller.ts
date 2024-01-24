import { Controller } from "@nestjs/common";
import { RoleService } from "../service";
import { initLoader } from "../init";

@Controller("role")
export class RoleController {
  constructor(private roleService: RoleService) {
    // 初始化三个角色
    initLoader(this.roleService);
  }
}
