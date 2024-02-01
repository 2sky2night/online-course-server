import { Folder } from "@src/lib/folder/index";
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  createReadStream,
  writeFileSync,
  unlink,
  rmdirSync,
  statSync,
} from "node:fs";
import { resolve } from "node:path";
import { BadRequestException } from "@nestjs/common";
import { UploadMessage } from "@src/config/message";

/**
 * 切片目录API
 */
export class ChunkFolder extends Folder {
  /**
   * 视频目录绝对路径
   * @private
   */
  private videoBasePath: string;
  /**
   * 视频目录相对路径
   * @private
   */
  private videoRootPath: string;

  /**
   * @param basePath 切片目录绝对路径
   * @param rootPath 相对路径
   * @param videoBasePath 视频目录绝对路径
   * @param videoRootPath 视频目录相对路径
   */
  constructor(
    basePath: string,
    rootPath: string,
    videoBasePath: string,
    videoRootPath: string,
  ) {
    super(basePath, rootPath);
    this.videoBasePath = videoBasePath;
    this.videoRootPath = videoRootPath;
  }

  /**
   * 目录中是否存在此切片文件夹
   * @param dirname 文件夹名称
   * @return {string|null} 存在返回切片文件夹的绝对路径，不存在返回null
   */
  hasDir(dirname: string) {
    const path = resolve(this.basePath, `./${dirname}`);
    if (existsSync(path)) {
      return path;
    } else {
      return null;
    }
  }

  /**
   * 读取目录中某个文件夹中的所有文件(若路径不存在，则返回null)
   * @param dirname 文件夹名称
   */
  readFolderdir(dirname: string) {
    // 拼接出文件夹路径
    const path = resolve(this.basePath, `./${dirname}`);
    if (existsSync(path)) {
      // 此文件夹存在，读取此文件夹中的文件
      return readdirSync(path);
    } else {
      // 文件夹不存在
      return null;
    }
  }

  /**
   * 在目录中创建切片文件夹
   * @param dirname 文件夹的名称
   * @return {string} 此文件夹的绝对路径
   */
  mkdir(dirname: string) {
    const path = resolve(this.basePath, `./${dirname}`);
    mkdirSync(path);
    return path;
  }

  /**
   * 在切片文件夹中添加文件
   * @param folderPath 切片文件夹的绝对路径
   * @param fileName 文件名称
   * @param buffer 文件数据
   * @return {string} 切片文件的绝对路径
   */
  addFileInFolder(
    folderPath: string,
    fileName: string,
    buffer: Buffer,
  ): string {
    // 切片文件的路径
    const filePath = resolve(folderPath, `./${fileName}`);
    if (existsSync(folderPath)) {
      // 文件夹存在，直接保存文件
      writeFileSync(filePath, buffer);
    } else {
      // 文件夹不存在
      // 创建文件夹
      mkdirSync(folderPath);
      // 递归调用，将切片文件保存在切片文件夹中
      return this.addFileInFolder(folderPath, fileName, buffer);
    }
    return filePath;
  }

  /**
   * 将视频合并到视频文件夹中
   * @param fileHash 切片文件名称
   * @param chunkCount 切片数量
   * @return {string} 视频存储的相对路径
   */
  async mergeChunk(fileHash: string, chunkCount: number) {
    // 1.查询此切片文件夹是否存在
    const chunkFolder = this.readFolderdir(fileHash);
    if (chunkFolder === null)
      throw new BadRequestException(UploadMessage.chunk_folder_not_exists); // 切片文件夹不存在
    // 2.校验文件数量是否一致
    if (chunkCount !== chunkFolder.length)
      throw new BadRequestException(UploadMessage.chunk_check_error);
    // 3.校验切片是否完整，因为切片名称与索引保存一致
    const formatFolder = chunkFolder
      .map((fileName) => {
        const format = Number(fileName);
        if (Number.isNaN(format)) {
          throw new BadRequestException(UploadMessage.chunk_check_error);
        }
        return format;
      })
      .sort((a, b) => a - b);
    formatFolder.forEach((fileName, index) => {
      if (fileName !== index)
        throw new BadRequestException(UploadMessage.chunk_check_error);
    });
    // 4.创建合并文件
    const videoPath = resolve(this.videoBasePath, `./${fileHash}.mp4`);
    // 缓存每个切片大小
    const chunkSize = Number(process.env.FILE_CHUNK_SIZE);
    // 按照切片顺序，读取切片数据，并写入到目标文件的对应偏移量里
    await Promise.all(
      formatFolder.map((chunkName) => {
        return new Promise<void>((res, rej) => {
          const chunkPath = resolve(
            this.basePath,
            `./${fileHash}/${chunkName}`,
          );
          // 读取切片文件
          const rs = createReadStream(chunkPath);
          // 创建可写流
          const ws = createWriteStream(videoPath, {
            // chunkName本身就是切片索引
            start: chunkName * chunkSize,
          });
          // 读出数据并写入到可写流
          rs.pipe(ws);
          rs.on("end", res);
          rs.on("error", rej);
          // ws.on("drain", res);
          ws.on("error", rej);
        });
      }),
    );
    // 获取视频信息（可以让数据从内存加载到磁盘中）
    statSync(videoPath).size; // 不能删除此行代码，因为本函数无法准确的在合并完成时结束（fullfilled）Promise，调用此函数刚好可以让Promise延迟一会结束
  }

  /**
   * 删除当前目录中某个文件夹
   * @param dirname 文件夹名称
   */
  async deleFolder(dirname: string) {
    const path = this.hasDir(dirname);
    if (path === null)
      throw new BadRequestException(UploadMessage.chunk_folder_not_exists);
    // 遍历文件夹中的文件，逐一删除
    const fileNameList = readdirSync(path);
    await Promise.all(
      fileNameList.map((fileName) => {
        // 文件路径
        const filePath = resolve(path, `./${fileName}`);
        return new Promise<void>((res, rej) => {
          unlink(filePath, (err) => {
            if (err) rej();
            res();
          });
        });
      }),
    );
    // 删除文件夹
    rmdirSync(path);
  }
}
