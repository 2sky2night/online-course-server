import { resolve as pathResolve, basename } from "node:path";
import { existsSync, mkdirSync, readdirSync, rmdir, unlink } from "node:fs";
import {
  generateVideo,
  getVideoResolution,
  generateM3U8Video,
} from "@src/utils/ffmpeg";

/**
 * 视频处理(封装了对合并完成后的视频进行处理的API)
 */
export class VideoProcessing {
  /**
   * 转码后的视频临时存储路径(绝对路径)
   * @private
   */
  private videoTempPath: string;
  /**
   * 用户上传的视频路径(绝对路径)
   * @private
   */
  private uploadVideoPath: string;
  /**
   * 密钥信息的路径(绝对路径)
   * @private
   */
  private keyInfoPath: string;
  /**
   * 视频存储的路径(绝对路径)
   * @private
   */
  private m3u8Path: string;

  /**
   * @param uploadVideoPath 用户上传的视频文件夹路径
   */
  constructor(uploadVideoPath: string) {
    this.uploadVideoPath = uploadVideoPath;
    this.videoTempPath = process.env.VIDEO_TEMP_PATH;
    this.keyInfoPath = process.env.VIDEO_KEY_INFO_PATH;
    this.m3u8Path = process.env.VIDEO_PATH;
    if (!existsSync(this.uploadVideoPath)) {
      // 检查上传视频文件夹是否有效
      throw new Error("上传视频文件夹不存在!");
    }
    if (!existsSync(this.videoTempPath)) {
      // 自动创建转码后的视频文件夹
      mkdirSync(this.videoTempPath);
    }
    if (!existsSync(this.m3u8Path)) {
      // 自动创建保存m3u8视频的文件夹
      mkdirSync(this.m3u8Path);
    }
  }

  /**
   * 将原有视频转码为多个分辨率版本（根据上传的视频转码成多个分辨率的h264的视频）
   * @param hash 视频hash值
   */
  async generateTempVideos(hash: string) {
    // 1.计算出此视频需要的分辨率
    // 视频的原本路径
    const videoPath = pathResolve(this.uploadVideoPath, `./${hash}.mp4`);
    // 获取视频的分辨率
    const { height } = await getVideoResolution(videoPath);
    // 计算出视频所有的分辨率
    const { list: pList, raw } = this.calculateResolution(height);
    // 2.将各个分辨率的视频输出到临时文件夹中
    // 创建临时文件夹
    const dirPath = pathResolve(this.videoTempPath, `./${hash}`);
    mkdirSync(dirPath);
    // 并发的输出各个分辨率的h264编码视频
    const list = pList.concat(raw ? [undefined] : []).map((p) => {
      const inputPath = videoPath;
      // 输出视频的名称:分辨率.mp4，若是原画则命名为:raw.mp4
      let outputPath = "";
      if (p === undefined) {
        outputPath = pathResolve(dirPath, "./raw.mp4");
      } else {
        outputPath = pathResolve(dirPath, `./${p}.mp4`);
      }
      return generateVideo(inputPath, outputPath, p);
    });
    await Promise.all(list);
    return {
      pList,
      raw,
    };
  }

  /**
   * 将原有视频加密处理为m3u8文件（将临时文件夹中存储的各个版本的分辨率视频输出为m3u8文件，存储路径格式为: /hash/分辨率/index.m3u8）
   * @param hash 视频文件的hash值(会在临时文件夹中读取此名称的文件夹，并将其中的所有视频转码)
   * @return {Promise<string[]>} 所有m3u8视频文件的绝对路径
   */
  async generateM3U8Videos(hash: string) {
    // 1.读取临时视频
    // 读取此视频临时文件夹
    const tempPath = pathResolve(this.videoTempPath, `./${hash}`);
    const list = readdirSync(tempPath);
    // 2.遍历临时视频，并输出这些临时视频的m3u8文件
    // 创建此视频的文件夹
    const videoDirPath = pathResolve(this.m3u8Path, `./${hash}`);
    mkdirSync(videoDirPath);
    // 遍历临时文件夹中的视频(各个分辨率的视频)并加密转换成m3u8文件
    const taskList = list.map((filename) => {
      // 输入文件
      const inputPath = pathResolve(tempPath, `./${filename}`);
      // 创建此分辨率的视频m3u8文件夹
      const m3u8DirPath = pathResolve(
        videoDirPath,
        `./${basename(filename, ".mp4")}`,
      );
      mkdirSync(m3u8DirPath);
      // 输出此视频的m3u8文件
      return generateM3U8Video(inputPath, m3u8DirPath, this.keyInfoPath);
    });
    return Promise.all(taskList);
  }

  /**
   * 计算出视频分辨率
   * @param height 视频分辨率
   */
  calculateResolution(height: number) {
    // 需要生成的视频版本
    let list: number[] = [];
    // 是否需要生成原画版本
    let raw = true;
    // 判断视频的版本
    if (height >= 1080) {
      list = [360, 480, 720, 1080];
    } else if (height >= 720) {
      list = [360, 480, 720];
    } else if (height >= 480) {
      list = [360, 480];
    } else if (height >= 360) {
      list = [360];
    }
    if (height === 1080 || height === 720 || height === 480 || height === 360) {
      // 不需要生成原画版本，因为其分辨率已经包含在视频版本中了
      raw = false;
    }
    return {
      list,
      raw,
    };
  }

  /**
   * 在临时视频文件夹中删除所有视频
   * @param hash 文件hash
   */
  async deleteTempVideos(hash: string) {
    // 此视频的临时文件夹
    const tempPath = pathResolve(this.videoTempPath, `./${hash}`);
    // 读取此视频下的文件
    const list = readdirSync(tempPath);
    // 并发删除视频文件
    await Promise.all(
      list.map((filename) => {
        const filePath = pathResolve(tempPath, `./${filename}`);
        return new Promise<void>((resolve, reject) => {
          unlink(filePath, (err) => {
            if (err) reject(err);
            resolve();
          });
        });
      }),
    );
    // 删除临时视频文件夹
    return new Promise<void>((resolve, reject) => {
      rmdir(tempPath, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
}
