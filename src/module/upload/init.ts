import { UploadConfig } from "@src/config/upload/types";
import { mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * 初始化时需要创建上传文件夹
 * @param uploadConfig
 */
export const initLoader = ({
  upload_root_path,
  upload_comment_path,
  upload_img_path,
  upload_video_path,
  upload_video_temp_path,
  upload_avatar_path,
  upload_user_avatar_path,
  upload_account_avatar_path,
}: UploadConfig) => {
  // 上传文件根路径
  const rootPath = resolve(upload_root_path);
  mkdirIfNotFound(rootPath);
  // 上传图片的路径
  const imgPath = resolve(rootPath, `./${upload_img_path}`);
  mkdirIfNotFound(imgPath);
  // 上传视频的路径
  const videoPath = resolve(rootPath, `./${upload_video_path}`);
  mkdirIfNotFound(videoPath);
  // 上传视频切片的路径
  const videoTempPath = resolve(rootPath, `./${upload_video_temp_path}`);
  mkdirIfNotFound(videoTempPath);
  // 上传头像的路径
  const avatarPath = resolve(rootPath, `./${upload_avatar_path}`);
  mkdirIfNotFound(avatarPath);
  // 上传前台用户头像的路径
  const userAvatarPath = resolve(rootPath, `./${upload_user_avatar_path}`);
  mkdirIfNotFound(userAvatarPath);
  // 上传后台用户头像的路径
  const accountAvatarPath = resolve(
    rootPath,
    `./${upload_account_avatar_path}`,
  );
  mkdirIfNotFound(accountAvatarPath);
  // 上传评论配图的路径
  const commentPath = resolve(rootPath, `./${upload_comment_path}`);
  mkdirIfNotFound(commentPath);
};

const mkdirIfNotFound = (path: string) => {
  if (existsSync(path) === false) {
    mkdirSync(path);
  }
};
