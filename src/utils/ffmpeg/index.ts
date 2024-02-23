import { resolve as Re } from "node:path";
import { exec } from "node:child_process";
import { existsSync } from "node:fs";
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

/**
 * 获取视频分辨率
 * @param videoPath 视频路径
 */
export function getVideoResolution(videoPath: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }
      const videoInfo = metadata.streams.find(
        (stream) => stream.codec_type === "video",
      );
      if (videoInfo === undefined) {
        reject("此文件不包含视频源!");
      }
      const { width, height } = videoInfo;
      if (!width || !height) {
        reject("未能查询到此视频的分辨率信息");
      }
      resolve({
        width,
        height,
      });
    });
  });
}

/**
 * 输出h264编码的视频
 * @param inputPath 输入路径
 * @param outputPath 输出路径
 * @param height 分辨率，若不指定则以源分辨率输出
 * @return {string} 输出的绝对路径
 */
export function generateVideo(
  inputPath: string,
  outputPath: string,
  height?: number,
) {
  const cmd = ffmpeg(inputPath).format("mp4").output(outputPath);
  if (height !== undefined) {
    // 设置了视频分辨率
    cmd.size(`?x${height}`);
    // 根据不同的分辨率设置不同的视频比例
    if (height <= 480) {
      cmd.aspect("4:3");
    } else {
      cmd.aspect("16:9");
    }
  }
  // 执行
  cmd.run();
  return new Promise<string>((resolve, reject) => {
    cmd.on("error", reject);
    cmd.on("end", () => {
      resolve(outputPath);
    });
  });
}

/**
 * 将视频转换成m3u8片段，每5秒为一个片段
 * @param inputPath 输入路径
 * @param outputDirPath 输出路径文件夹
 * @param keyInfoPath 加密文件信息的路径
 * @return {string} 返回m3u8文件存储的绝对路径
 */
export function generateM3U8Video(
  inputPath: string,
  outputDirPath: string,
  keyInfoPath: string,
) {
  return new Promise<string>((resolve, reject) => {
    if (!existsSync(inputPath)) {
      return reject("输入视频文件不存在!");
    }
    // m3u8文件的绝对路径
    const m3u8Path = Re(outputDirPath, "./index.m3u8");
    exec(
      `ffmpeg -y -i ${inputPath} -hls_time 5 -hls_key_info_file ${keyInfoPath} -hls_playlist_type vod -hls_segment_filename "${Re(
        outputDirPath,
        "./chunk-%d.ts",
      )}" ${m3u8Path}
`,
      (err) => {
        if (err) return reject(err);
        resolve(m3u8Path);
      },
    );
  });
}
