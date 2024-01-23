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
  send_email_error: "发送邮箱失败!",
  get_token_data_empty: "守卫未解析出token数据!",
  get_token_data_error: "token中无此数据!",
  forbidden: "无权访问此资源!",
});

/**
 * 账户模块的提示词
 */
export const AccountMessage = Object.freeze({
  name_exists: "此账户名已经存在了!",
});

/**
 * 鉴权模块的提示词
 */
export const AuthMessage = Object.freeze({
  username_or_password_error: "用户名或密码错误!",
  username_is_exists: "用户名已经存在!",
  email_is_exists: "邮箱已经存在!",
  role_name_is_error: "角色名称不存在!",
  account_is_register: "账户已经注册过了!",
  wait_approval: "请等待后台管理员审批通过!",
  apply_is_not_exists: "此申请号不存在!",
  token_error: "token不合法!",
  token_empty: "未携带token!",
  approvaled_error: "此注册申请已经被审批过了",
  email_code_send_error: "邮箱验证码发送失败，请检查邮箱是否正确!",
  email_code_error: "邮箱验证码无效!",
  email_send_error: "发送邮箱失败，请检查邮箱是否正确!",
});

/**
 * 服务器内置提示词
 */
export const ServerMessage = Object.freeze({
  init_super_admin_error: "初始化超级管理员失败!",
  init_role_error: "初始化角色失败!",
  init_super_admin_success: "初始化超级管理员成功!",
  init_role_success: "初始化角色成功!",
  init_register_type_success: "初始化注册方式成功!",
  init_register_type_error: "初始化注册方式失败!",
  server_error: "服务器内部错误!",
});
