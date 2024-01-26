import { existsSync, createWriteStream, mkdirSync, readdirSync } from "node:fs";
import { resolve, extname } from "node:path";

/**
 * 封装操作某个目录的API
 */
export class Folder {
  /**
   * 根路径（绝对路径）
   */
  private readonly basePath: string;
  /**
   * 根路径（相对路径，相对于上传根路径的路径）
   */
  private readonly rootPath: string;

  /**
   * @param basePath 绝对路径
   * @param rootPath 相对路径(此路径是相对于上传路径)
   */
  constructor(basePath: string, rootPath: string) {
    this.basePath = basePath;
    this.rootPath = rootPath;
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
   * @param fileName 文件名
   * @param buffer 文件数据
   */
  addFile(fileName: string, buffer: Buffer): Promise<void> {
    // 检查路径是否存在，不存在先创建
    this.checkBasePath();
    // 创建文件
    const ws = createWriteStream(resolve(this.basePath, `./${fileName}`));
    return new Promise((resolve, reject) => {
      ws.end(buffer, () => {
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

  /**
   * 使用hash.后缀的方式来保存文件
   * @param fileName 文件名
   * @param hash hash值
   * @param buffer 文件数据
   * @return {string} 目标文件基于上传根路径的相对路径
   */
  async addFileWithHash(fileName: string, hash: string, buffer: Buffer) {
    const ext = extname(fileName);
    let hashFileName = "";
    if (ext.length === 0 || ext.length === 1) {
      // 若文件无后缀名或若文件后缀名为空，则文件名称直接为hash值
      hashFileName = hash;
    } else {
      // 若文件的后缀名有效，则文件为hash拼接后缀名
      hashFileName = hash + ext;
    }
    await this.addFile(hashFileName, buffer);
    return this.rootPath + `/${hashFileName}`;
  }

  /**
   * 查询该目录中是否存在某个文件
   * @param filename 文件名
   * @param ext 是否忽略扩展名
   * @return {string|null} 目标文件基于上传根路径的相对路径,若不存在，返回null
   */
  inFilename(filename: string, ext = false): string | null {
    const list = readdirSync(this.basePath);
    if (ext) {
      // 忽略扩展名
      const item = list.find((name) => {
        const index = name.lastIndexOf(".");
        if (index === -1) {
          // 无扩展名
          return name === filename;
        } else {
          // 有扩展名，去除扩展名与目标文件名比对
          return name.slice(0, index) === filename;
        }
      });
      if (item) {
        return this.rootPath + `/${item}`;
      } else {
        return null;
      }
    } else {
      // 不忽略扩展名，全匹配整个文件名
      const item = list.find((name) => name === filename);
      if (item) {
        return this.rootPath + `/${item}`;
      } else {
        return null;
      }
    }
  }
}
