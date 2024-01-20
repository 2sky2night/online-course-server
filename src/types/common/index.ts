import { Roles } from "@src/module/role/enum";

/**
 * 事件名称
 */
export type EventName = "ROLE_DATA_INIT_DONE";

/**
 * 事件监听的回调
 */
export type EventHandler = (...args: any[]) => unknown;

/**
 * 后台账户中的Token数据
 */
export type AccountToken = {
  sub: number;
  role_name: Roles;
};
