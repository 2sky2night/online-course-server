// role.decorator.ts
import { SetMetadata } from "@nestjs/common";
import { Roles } from "@src/module/role/enum";

/**
 * 角色装饰器,会在元数据中添加 roles 属性，属性值就是可以访问的此控制器的角色
 * @param roles
 * @constructor
 */
export const Role = (...roles: Roles[]) => {
  return SetMetadata("roles", roles);
};
