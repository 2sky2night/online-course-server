/**
 * 上传配置项的环境变量
 */
export interface UploadConfig {
  /**
   * 上传资源的根路径(绝对路径)
   */
  upload_root_path: string;
  /**
   * 上传资源的根路径（相对路径）
   */
  upload_path: string;
  /**
   * 上传图片的路径(一级路径)
   */
  upload_img_path: string;
  /**
   * 上传视频的路径(一级路径)
   */
  upload_video_path: string;
  /**
   * 上传头像图片的路径
   */
  upload_avatar_path: string;
  /**
   * 上传用户（前台）头像的路径
   */
  upload_user_avatar_path: string;
  /**
   * 上传账户（后台）头像的路径
   */
  upload_account_avatar_path: string;
  /**
   * 视频切片文件的路径(一级路径)
   */
  upload_video_temp_path: string;
  /**
   * 上传评论的路径
   */
  upload_comment_path: string;
}
