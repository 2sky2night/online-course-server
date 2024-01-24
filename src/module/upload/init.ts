import { UploadConfig } from "@src/config/upload/types";
import { mkdirSync, existsSync } from "node:fs";

/**
 * 初始化时需要创建上传文件夹
 * @param uploadConfig
 */
export const initLoader = ({
  upload_path,
  upload_img_path,
  upload_video_path,
  upload_video_temp_path,
  upload_avatar_path,
  upload_user_avatar_path,
  upload_account_avatar_path,
}: UploadConfig) => {
  // 1.上传文件夹的根文件夹
  mkdirIfNotFound(upload_path);
  // 2.上传图片文件夹
  mkdirIfNotFound(upload_img_path);
  // 3.上传视频文件夹
  mkdirIfNotFound(upload_video_path);
  // 4.上传视频切片文件夹
  mkdirIfNotFound(upload_video_temp_path);
  // 5.上传头像文件夹
  mkdirIfNotFound(upload_avatar_path);
  // 6.上传前台用户头像文件夹
  mkdirIfNotFound(upload_user_avatar_path);
  // 7.上传后台用户头像文件夹
  mkdirIfNotFound(upload_account_avatar_path);
};

const mkdirIfNotFound = (path: string) => {
  if (existsSync(path) === false) {
    mkdirSync(path);
  }
};
