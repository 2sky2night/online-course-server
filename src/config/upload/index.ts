import { registerAs } from "@nestjs/config";
import type { UploadConfig as UploadConfigType } from "./types";

/**
 * 文件上传环境变量配置
 */
export const UploadConfig = registerAs<UploadConfigType>("upload", () => {
  // 上传文件的根路径(绝对路径)
  const upload_root_path = process.env.UPLOAD_PATH;
  // 上传图片的路径（一级路径）
  const upload_img_path = `/img`;
  // 上传视频的路径（一级路径）
  const upload_video_path = `/video`;
  // 上传视频切片的路径（一级路径）
  const upload_video_temp_path = `/video-temp`;
  // 上传头像的路径
  const upload_avatar_path = `${upload_img_path}/avatar`;
  // 上传前台用户头像的路径
  const upload_user_avatar_path = `${upload_avatar_path}/user`;
  // 上传后台用户头像的路径
  const upload_account_avatar_path = `${upload_avatar_path}/account`;
  // 上传评论配图的路径
  const upload_comment_path = `${upload_img_path}/comment`;

  return {
    upload_root_path,
    upload_img_path,
    upload_video_path,
    upload_avatar_path,
    upload_user_avatar_path,
    upload_account_avatar_path,
    upload_video_temp_path,
    upload_comment_path,
  };
});
