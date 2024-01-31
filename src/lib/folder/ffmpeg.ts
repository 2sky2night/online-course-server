import { existsSync, mkdirSync, readFileSync, unlink } from "node:fs";
import { Logger } from "@nestjs/common";
import { v4 as uuidV4 } from "uuid";
import { Folder } from "@src/lib/folder/index";
import { extractFirstFrame } from "@src/utils/ffmpeg";
import { generateFileHash } from "@src/utils/tools";

/**
 * 目录API，增加视频处理的API
 */
export class FfmpegFolder extends Folder {
  /**
   * 存放视频封面的临时文件夹
   */
  tempPath: string;

  constructor(base: string, root: string) {
    super(base, root);
    // 初始化临时视频封面文件夹
    const path = process.env.AUTO_VIDEO_COVER_TEMP;
    this.tempPath = path;
    if (existsSync(path) === false) {
      mkdirSync(path);
    }
  }

  /**
   * 截取视频第一帧，并保存在当前路径中(命名方式:hash.jpg)
   * 1.会通过ffmpeg生成临时快照(临时快照格式:uuid-v4.jpg)
   * 2.读取临时快照文件，计算hash
   * 3.查询文件系统中是否存储过，未存储存储
   * 4.返回相对路径
   * @param filePath 文件路径
   * @return {string} 目标文件基于上传根路径的相对路径
   */
  async setVideoFirstFrame(filePath: string): Promise<string> {
    // 视频文件是否存在
    if (existsSync(filePath) === false) {
      Logger.error(`FolderAPI Error: ${filePath} 路径不存在!`);
      throw new Error(`FolderAPI Error: ${filePath} 路径不存在!`);
    }
    try {
      // 生成视频封面
      const fsFilePath = await extractFirstFrame(
        filePath,
        this.tempPath,
        `${uuidV4()}.jpg`,
      );
      // 读取生成的视频封面文件
      const buffer = readFileSync(fsFilePath);
      // 计算文件hash
      const hash = generateFileHash(buffer);
      // 根据hash在文件系统中查询当前是否存储过此视频封面
      const coverPath = this.inFilename(hash, true);
      // 后台静默删除临时封面
      unlink(fsFilePath, (err) => {
        if (err) {
          Logger.error("FolderAPI Error:删除" + fsFilePath + "文件失败!");
        }
      });
      if (coverPath) {
        return coverPath;
      } else {
        // 未存储过，则保存此视频封面
        return this.addFileWithHash(`${hash}.jpg`, hash, buffer);
      }
    } catch (error) {
      Logger.error(error);
      throw new Error(error);
    }
  }
}
