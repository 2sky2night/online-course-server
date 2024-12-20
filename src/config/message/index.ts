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
  validation_error_with_tips: (tips: string) => `表单校验失败:${tips}`,
  validation_error: "表单校验失败!",
  send_email_error: "发送邮箱失败!",
  get_token_data_empty: "守卫未解析出token数据!",
  get_token_data_error: "token中无此数据!",
  forbidden: "无权访问此资源!",
  user_lose_effectiveness: "此用户无效!",
  form_empty_error: "表单字段不能为空!",
  form_fields_error: "表单字段错误!",
  password_error: "密码错误!",
  password_update_equal_error: "新旧密码不能一致!",
  upload_file_size_error: "上传的文件大小过大!",
  upload_file_type_error: "上传的文件类型错误!",
  upload_file_empty_error: "此字段未上传文件!",
  int_pipe_type_error: (field?: string) =>
    field ? `${field}的类型必须是数值型!` : "字段校验失败!",
  int_pipe_empty_error: (field?: string) =>
    field ? `${field}不能为空!` : "字段校验失败!",
});

/**
 * 账户模块的提示词
 */
export const AccountMessage = Object.freeze({
  name_exists: "此账户名已经存在了!",
  account_not_found: "此账户不存在!",
});

/**
 * 用户模块的提示词
 */
export const UserMessage = Object.freeze({
  user_not_found: "此用户不存在!",
  name_exists: "此用户名已经存在了!",
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
  email_not_exists: "此邮箱未注册!",
  auth_code_error: "授权码无效!",
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
  init_upload_folder_success: "初始化创建上传文件夹成功!",
  init_upload_folder_error: "初始化创建上传文件夹失败!",
});

/**
 * 上传提示词
 */
export const UploadMessage = Object.freeze({
  trace_not_exists: "此上传记录不存在!",
  chunk_hash_error: "切片的hash必须是数字且大于等于0!",
  chunk_folder_not_exists: "未上传过此文件!",
  chunk_check_error: "校验切片文件错误!",
  fast_upload_fail: "秒传失败,文件未上传过!",
  fast_upload_success: "秒传成功!",
  video_processing_01: "正在生成此视频的各个分辨率的版本...",
  video_processing_02: "正在加密各个分辨率的视频...",
  video_processing_not_exist: "此id的视频处理信息不存在!",
  get_video_processing_error: "视频处理进度id不能为空!",
  get_video_merge_error: "视频合并进度id不能为空!",
  video_merge_not_exist: "此id的视频合并信息不存在!",
  video_merging: "正在合并视频文件中...",
});

/**
 * 视频提示词
 */
export const VideoMessage = Object.freeze({
  file_type_error: "选择的文件类型错误!",
  file_is_not_owner: "选择的文件非当前用户上传!",
  video_not_exist: "此视频不存在!",
  collection_not_exist: "此视频合集不存在!",
  video_is_not_owner: "此视频非当前用户上传!",
  collection_is_not_owner: "此视频合集非当前用户创建!",
  collection_has_video: "视频合集中存在此视频了!",
  collection_has_not_video: "视频合集中不存在此视频!",
  video_history_time_error: "观看时长大于视频时长!",
  like_video_error: "已经点赞过此视频了!",
  cancel_like_video_error: "未点赞过此视频!",
  comment_not_exist: "此评论不存在!",
  like_comment_error: "已经点赞过此评论了!",
  cancel_like_comment_error: "未点赞过此评论!",
  remove_video_history_error: "未浏览过此视频!",
  reply_not_exist: "此回复不存在!",
  comment_not_include_reply: "目标评论不包含此回复!",
  like_reply_error: "已经点赞过此回复了!",
  cancel_like_reply_error: "未点赞过此回复!",
  partition_not_exist: "此分区不存在!",
  partition_name_is_exist: "此名称的分区已经存在!",
  update_video_partition_error: "目标分区不能为当前视频的分区!",
  update_video_collection_partition_error: "目标分区不能为当前视频合集的分区!",
  tag_not_exist: "此标签不存在!",
  tag_name_is_exist: "此名称的标签已经存在!",
  update_tag_name_error: "不能与当前标签名称一致!",
  add_video_tags_error: "该视频已经包含此标签了!",
  remove_video_tags_error: "该视频不包含此标签!",
  add_collection_tags_error: "该视频合集已经包含此标签了!",
  remove_collection_tags_error: "该视频合集不包含此标签!",
  dec_watch_video_error: "此视频当前无任何人观看!",
  dec_watch_video_user_error: "当前用户未观看此视频!",
  favorite_not_exist: "此收藏夹不存在!",
  favorite_is_not_owner: "此收藏夹非当前用户创建!",
  favorite_video_error: "有收藏夹已经收藏此视频了!",
  remove_favorite_video_error: "有视频不在该收藏夹中!",
  subscribe_collection_error: "此合集已经被订阅过了!",
  unsubscribe_collection_error: "此合集未订阅!",
  create_danmu_error: "发布时间超过视频的时长!",
  get_danmu_error: "开始时间不能大于结束时间!",
  push_video_error: "此文件还在处理中，禁止发布!",
});

/**
 * 文件模块提示词
 */
export const FileMessage = Object.freeze({
  file_not_exist: "此文件不存在!",
});

/**
 * 监控模块的提示词
 */
export const MonitorMessage = Object.freeze({
  system_call_error: "获取系统信息失败!",
});
