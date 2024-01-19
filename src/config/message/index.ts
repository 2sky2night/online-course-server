/**
 * role模块的提示词
 */
export const RoleMessage = Object.freeze({
  name_exists: "此角色名称已经存在了!",
  id_is_not_exists: "此角色id不存在!",
});

/**
 * 通用的提示词
 */
export const CommonMessage = Object.freeze({
  validation_error_with_tips: (tips) => `表单校验失败:${tips}`,
  validation_error: "表单校验失败!",
});

/**
 * 账户模块的提示词
 */
export const AccountMessage = Object.freeze({
  name_exists: "此账户名已经存在了!",
});

export const ServerMessage = Object.freeze({
  init_super_admin_error: "初始化超级管理员失败!",
  init_role_error: "初始化角色失败!",
  init_super_admin_success: "初始化超级管理员成功!",
  init_role_success: "初始化角色成功!",
});
