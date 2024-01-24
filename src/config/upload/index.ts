import { registerAs } from "@nestjs/config";
import { resolve } from "node:path";
import type { UploadConfig as UploadConfigType } from "./types";

/**
 * 文件上传环境变量配置
 */
export const UploadConfig = registerAs<UploadConfigType>("upload", () => {
  // 上传文件的根路径
  const upload_path = resolve(__dirname, "../../../../upload");
  // 上传图片的路径
  const upload_img_path = resolve(upload_path, "./img");
  // 上传视频的路径
  const upload_video_path = resolve(upload_path, "./video");
  // 上传视频的临时路径(切片文件夹)
  const upload_video_temp_path = resolve(upload_path, "./video-temp");
  // 上传头像的路径
  const upload_avatar_path = resolve(upload_img_path, "./avatar");
  // 上传前台用户头像的路径
  const upload_user_avatar_path = resolve(upload_avatar_path, "./user");
  // 上传后台用户头像的路径
  const upload_account_avatar_path = resolve(upload_avatar_path, "./account");
  // 上传评论配图的路径
  const upload_comment_path = resolve(upload_img_path, "./comment");
  return {
    upload_path,
    upload_img_path,
    upload_video_path,
    upload_avatar_path,
    upload_user_avatar_path,
    upload_account_avatar_path,
    upload_video_temp_path,
    upload_comment_path,
  };
});
