import { existsSync, createWriteStream, mkdirSync } from "node:fs";
import { resolve } from "node:path";

/**
 * 封装操作某个目录的API
 */
export class Folder {
  /**
   * 根路径
   */
  private readonly basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
    this.checkBasePath();
  }

  /**
   * 检查路径是否存在，不存在就递归创建
   */
  checkBasePath() {
    if (existsSync(this.basePath) === false) {
      // 路径不存在，则递归创建
      mkdirSync(this.basePath, { recursive: true });
    }
  }

  /**
   * 添加一个文件
   * @param fileName
   * @param File
   */
  addFile(fileName: string, File: Buffer): Promise<void> {
    // 检查路径是否存在，不存在先创建
    this.checkBasePath();
    // 创建文件
    const ws = createWriteStream(resolve(this.basePath, `./${fileName}`));
    return new Promise((resolve, reject) => {
      ws.end(File, () => {
        ws.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
      ws.on("error", (error) => reject(error));
    });
  }
}
