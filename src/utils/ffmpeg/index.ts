import { resolve as Re } from "node:path";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpeg = require("fluent-ffmpeg"); // 只能使用cjs的方式才能导入

/**
 * 截取视频的第一帧，并输出图片到对应路径中
 * @param videoPath 视频路径
 * @param outputPath 输出图片的文件夹路径
 * @param filename 文件名称
 * @return {string} 返回文件绝对路径
 */
export function extractFirstFrame(
  videoPath: string,
  outputPath: string,
  filename: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        count: 1,
        timestamps: ["00:00:00.001"],
        folder: outputPath,
        filename,
      })
      .on("end", () => {
        resolve(Re(outputPath, `./${filename}`));
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

/**
 * 截取视频的第一帧，并输出为二进制数据
 * @param videoPath 视频路径
 * @returns
 */
export function getVideoFirstFrame(videoPath: string): Promise<Buffer> {
  extractFirstFrame(videoPath, "D:", "123.jpg");
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoDuration = metadata.format.duration;
      const frameTime = Math.min(videoDuration, 1.0); // 取视频时长和 1 秒中较小的一个时间，以确保不超过视频长度

      ffmpeg(videoPath)
        .setStartTime(frameTime)
        .outputOptions("-frames:v", "1") // 仅输出一帧
        .format("image2pipe")
        .pipe()
        .on("data", (data) => {
          resolve(data);
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  });
}

/**
 * 获取视频长度
 * @param videoPath 视频路径
 */
export function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(metadata.format.duration);
    });
  });
}
