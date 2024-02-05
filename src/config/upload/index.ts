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
  // 上传视频封面的路径
  const upload_video_cover_path = `${upload_img_path}/video-cover`;
  // 自动生成的视频封面的路径
  const auto_video_cover_path = `${upload_img_path}/auto-video-cover`;
  // 视频合集封面的路径
  const upload_video_collection_cover_path = `${upload_img_path}/video-collection-cover`;
  // 视频评论的配图
  const upload_video_comment_path = `${upload_comment_path}/video`;
  // 上传回复配图的路径
  const upload_reply_path = `${upload_img_path}/reply`;
  // 上传视频回复配图的路径
  const upload_video_reply_path = `${upload_reply_path}/video`;
  return {
    upload_root_path,
    upload_img_path,
    upload_video_path,
    upload_avatar_path,
    upload_user_avatar_path,
    upload_account_avatar_path,
    upload_video_temp_path,
    upload_comment_path,
    upload_video_cover_path,
    auto_video_cover_path,
    upload_video_collection_cover_path,
    upload_video_comment_path,
    upload_video_reply_path,
    upload_reply_path,
  };
});
