import { Inject, Injectable, Logger } from "@nestjs/common";
import { ChunkFolder, Folder } from "@src/lib/folder";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountUpload } from "@src/module/upload/entity";
import { Repository } from "typeorm";
import { AccountService } from "@src/module/account/service";
import { generateFileHash } from "@src/utils/tools";
import { FileService } from "@src/module/file/service";
import { File } from "@src/module/file/entity";
import { FileType } from "@src/module/file/enum";
import { UploadMessage } from "@src/config/message";
import { readdirSync } from "node:fs";

@Injectable()
export class UploadVideoService {
  /**
   * 目录API:上传视频
   * @private
   */
  @Inject("UPLOAD_VIDEO")
  private videoFolder: Folder;
  /**
   * 目录API：视频切片
   * @private
   */
  @Inject("UPLOAD_VIDEO_TEMP")
  private tempFolder: ChunkFolder;
  /**
   * 后台账户上传追踪表
   * @private
   */
  @InjectRepository(AccountUpload)
  private AURepository: Repository<AccountUpload>;
  /**
   * 后台账户服务层
   * @private
   */
  @Inject(AccountService)
  private accountService: AccountService;
  /**
   * 文件服务层
   */
  @Inject(FileService)
  fileService: FileService;

  /**
   * 老师上传视频
   * @param accountId 上传者
   * @param file 直接上传
   * @deprecated
   */
  async uploadVideo(
    accountId: number,
    { originalname, buffer }: Express.Multer.File,
  ) {
    // 计算文件hash
    const hash = generateFileHash(buffer);
    // 文件系统是否存储了此文件
    const fsFilePath = this.videoFolder.inFilename(hash, true);
    if (fsFilePath) {
      // 文件系统存储了文件
      // 数据库中是否存储了此文件
      const dbFile = await this.fileService.findByPath(fsFilePath);
      if (dbFile) {
        // 数据库中存储了此文件记录，直接增加上传文件记录
        const trace = await this.createTrace(accountId, dbFile);
        return this.formatTrace(trace, dbFile);
      } else {
        // 数据库中未存储此文件记录
        // 创建此文件记录
        const file = await this.fileService.create(
          hash,
          fsFilePath,
          FileType.VIDEO,
        );
        const trace = await this.createTrace(accountId, file);
        return this.formatTrace(trace, file);
      }
    } else {
      // 文件系统中未存储此文件
      // 保存此文件
      const fsNewFilePath = await this.videoFolder.addFileWithHash(
        originalname,
        hash,
        buffer,
      );
      // 查询数据库中是否存储了此文件
      const dbFile = await this.fileService.findByPath(fsNewFilePath);
      if (dbFile) {
        // 存储了
        const trace = await this.createTrace(accountId, dbFile);
        return this.formatTrace(trace, dbFile);
      } else {
        // 未存储
        const file = await this.fileService.create(
          hash,
          fsNewFilePath,
          FileType.VIDEO,
        );
        const trace = await this.createTrace(accountId, file);
        return this.formatTrace(trace, file);
      }
    }
  }

  /**
   * 上传切片文件
   * @param file_hash 文件的hash
   * @param chunk_hash 切片的索引
   * @param buffer 切片文件
   */
  uploadChunk(file_hash: string, chunk_hash: string, buffer: Buffer) {
    // 查询文件系统中是否存储此切片文件夹?
    let folderPath = this.tempFolder.hasDir(file_hash);
    // 不存在此切片文件夹就创建此文件夹
    if (folderPath === null) folderPath = this.tempFolder.mkdir(file_hash);
    // 保存切片文件
    this.tempFolder.addFileInFolder(folderPath, chunk_hash, buffer);
    return null;
  }

  /**
   * 合并切片
   * @param accountId 账户id
   * @param fileHash 文件hash
   * @param chunkCount 切片数量
   */
  async mergeChunk(accountId: number, fileHash: string, chunkCount: number) {
    await this.accountService.findById(accountId, true);
    // 合并文件，输出到视频目录下
    await this.tempFolder.mergeChunk(fileHash, chunkCount);
    // 获取合并完成后的视频路径
    const path = this.videoFolder.inFilename(fileHash, true);
    // 查询数据库中是否保存了文件记录
    let file = await this.fileService.findByPath(path);
    // 后台静默删除合并文件
    this.tempFolder.deleFolder(fileHash).catch((e) => {
      Logger.error("删除切片文件夹失败:" + e);
    });
    if (file === null) {
      // 数据库中未保存，则增加此文件记录
      file = await this.fileService.create(fileHash, path, FileType.VIDEO);
    }
    // 增加上传记录
    const trace = await this.createTrace(accountId, file);
    return this.formatTrace(trace, file);
  }

  /**
   * 秒传
   * @param accountId 账户id
   * @param fileHash 文件hash
   */
  async fastUpload(accountId: number, fileHash: string) {
    // 在文件系统中查询文件是否存在
    const path = this.videoFolder.inFilename(fileHash, true);
    if (path === null) {
      // 秒传失败，文件不存在
      return {
        done: false,
        tips: UploadMessage.fast_upload_fail,
      };
    }
    // 秒传成功
    // 查询数据库中是否有此文件记录
    let file = await this.fileService.findByPath(path);
    if (file === null) {
      // 数据库无此文件记录，增加此文件记录
      file = await this.fileService.create(fileHash, path);
    }
    // 增加上传记录
    const trace = await this.createTrace(accountId, file);
    return {
      done: true,
      tips: UploadMessage.fast_upload_success,
      ...this.formatTrace(trace, file),
    };
  }

  /**
   * 获取切片上传进度
   * @param fileHash 文件hash
   */
  async chunkUploadProgress(fileHash: string) {
    // 临时目录中是否存在此切片文件夹?
    const chunkFolderPath = this.tempFolder.hasDir(fileHash);
    if (chunkFolderPath === null) return null;
    // 存在此切片文件夹，输出所有的切片文件（索引）名称
    const list = readdirSync(chunkFolderPath);
    return list.map((item) => Number(item)).sort((a, b) => a - b);
  }

  /**
   * 记录上传文件记录
   * @param accountId 上传者
   * @param file 文件实例
   */
  async createTrace(accountId: number, file: File) {
    const account = await this.accountService.findById(accountId, true);
    const trace = this.AURepository.create();
    trace.uploader = account;
    trace.file = file;
    return this.AURepository.save(trace);
  }

  /**
   * 格式化上传记录
   * @param trace
   * @param file
   */
  formatTrace(trace: AccountUpload, file: File) {
    return {
      trace_id: trace.trace_id,
      file_id: file.file_id,
      url: file.file_path,
    };
  }
}
