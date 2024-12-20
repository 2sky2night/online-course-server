import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

import { UploadConfig } from "@src/config/upload/types";

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
  upload_video_cover_path,
  auto_video_cover_path,
  upload_video_collection_cover_path,
  upload_video_comment_path,
  upload_video_reply_path,
  upload_reply_path,
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
  // 上传视频封面的路径
  const videoCoverPath = resolve(rootPath, `./${upload_video_cover_path}`);
  mkdirIfNotFound(videoCoverPath);
  // 内置视频封面路径
  const videoAutoCoverPath = resolve(rootPath, `./${auto_video_cover_path}`);
  mkdirIfNotFound(videoAutoCoverPath);
  // 视频合集封面路径
  const videoCollectionCoverPath = resolve(
    rootPath,
    `./${upload_video_collection_cover_path}`,
  );
  mkdirIfNotFound(videoCollectionCoverPath);
  // 视频评论配图的路径
  const videoCommentPath = resolve(rootPath, `./${upload_video_comment_path}`);
  mkdirIfNotFound(videoCommentPath);
  // 回复配图的路径
  const replyPath = resolve(rootPath, `./${upload_reply_path}`);
  mkdirIfNotFound(replyPath);
  // 视频回复配图的路径
  const replyVideoPath = resolve(rootPath, `./${upload_video_reply_path}`);
  mkdirIfNotFound(replyVideoPath);
};

const mkdirIfNotFound = (path: string) => {
  if (existsSync(path) === false) {
    mkdirSync(path);
  }
};
