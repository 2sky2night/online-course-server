import { readdirSync } from "node:fs";

import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UploadMessage, VideoMessage } from "@src/config/message";
import { ChunkFolder, Folder } from "@src/lib/folder";
import { VideoProcessing } from "@src/lib/video-processing";
import { Account } from "@src/module/account/entity";
import { AccountService } from "@src/module/account/service";
import { File } from "@src/module/file/entity";
import { FileType } from "@src/module/file/enum";
import { FileService } from "@src/module/file/service";
import { RedisService } from "@src/module/redis/redis.service";
import { AccountUpload } from "@src/module/upload/entity";
import { generateFileHash } from "@src/utils/tools";
import { Repository } from "typeorm";

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
   * 视频处理API
   * @private
   */
  @Inject("VIDEO_PROCESSING")
  private videoProcessingAPI: VideoProcessing;
  /**
   * redis服务层
   * @private
   */
  @Inject(RedisService)
  private redisService: RedisService;

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
  uploadChunk(
    file_hash: string,
    chunk_hash: string,
    buffer: Buffer,
  ): Promise<null> {
    // 查询文件系统中是否存储此切片文件夹?
    let folderPath = this.tempFolder.hasDir(file_hash);
    // 不存在此切片文件夹就创建此文件夹
    if (folderPath === null) folderPath = this.tempFolder.mkdir(file_hash);
    // 保存切片文件
    this.tempFolder.addFileInFolder(folderPath, chunk_hash, buffer);
    return null;
  }

  /**
   * 开始合并切片
   * @param accountId 账户id
   * @param fileHash 文件hash
   * @param chunkCount 切片数量
   */
  async toDoMergeChunk(
    accountId: number,
    fileHash: string,
    chunkCount: number,
  ) {
    const account = await this.accountService.findById(accountId, true);
    // 生成查询进度key
    const mergeKey = `video-merge:${fileHash}`;
    // 在redis中保存此key
    await this.redisService.set(mergeKey, UploadMessage.video_merging);
    // 后台静默对切片进行合并
    this.mergeChunk(account, fileHash, chunkCount)
      .then((result) => {
        // 合并成功，将文件信息保存在redis中，等待轮询获取此文件信息
        this.redisService.set(mergeKey, JSON.stringify(result));
      })
      .catch((err) => {
        Logger.error(`合并视频失败!原因：${err}`);
        // 合并失败，在redis删除此合并进度key
        this.redisService.del(mergeKey);
      });
    return {
      merge_key: mergeKey,
    };
  }

  /**
   * 合并切片
   * @param account 账户
   * @param fileHash 文件hash
   * @param chunkCount 切片数量
   */
  async mergeChunk(account: Account, fileHash: string, chunkCount: number) {
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
    const trace = await this.createTrace(account.account_id, file);
    return this.formatTrace(trace, file);
  }

  /**
   * 开始对视频进行处理
   * @param file_id 视频id
   * @param account_id 账户id
   */
  async toDoVideoProcessing(file_id: number, account_id: number) {
    const file = await this.fileService.findById(file_id, true);
    if (file.file_type !== FileType.VIDEO) {
      throw new BadRequestException(VideoMessage.file_type_error);
    }
    const account = await this.accountService.findById(account_id, true);
    if ((await this.fileService.fileAccountUploader(file, account)) === false) {
      // 此文件用户未上传过
      throw new BadRequestException(VideoMessage.file_is_not_owner);
    }
    // 生成查询视频处理的key
    const processingKey = `video-processing:${file.file_id}`;
    // 后台静默对视频进行处理
    this.videoProcessing(file, processingKey).catch((err) => {
      Logger.error(`处理视频失败!原因是:${err}`);
      // 在redis中移除此视频处理(视频处理失败，需要移除)
      this.redisService.del(processingKey);
    });
    return {
      processing_key: processingKey,
    };
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
   * 获取视频处理进度
   * @param processingKey id
   */
  async getVideoProcessingProgress(processingKey: string) {
    const value = await this.redisService.get(processingKey);
    if (value === null) {
      // 不存在
      throw new NotFoundException(UploadMessage.video_processing_not_exist);
    } else {
      // 存在
      if (value === "done") {
        return {
          done: true,
        };
      } else {
        return {
          tips: value,
          done: false,
        };
      }
    }
  }

  /**
   * 查询合并进度
   * @param mergeKey 合并key
   */
  async getVideoMergeProgress(mergeKey: string) {
    const value = await this.redisService.get(mergeKey);
    if (value === null) {
      throw new NotFoundException(UploadMessage.get_video_merge_error);
    } else {
      try {
        // 合并完成，redis中会记录的是文件信息
        const data = JSON.parse(value); // TODO 视频文件的url尽量不要暴露（24.3.17）
        return {
          ...data,
        };
      } catch {
        // 合并未完成，是提示信息
        return {
          tips: value,
        };
      }
    }
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

  /**
   * 处理视频，将源视频转换成多个分辨率的m3u8编码为h264的视频
   * @param file 文件实例
   * @param processingKey redis键
   */
  async videoProcessing(file: File, processingKey: string) {
    // 在redis中保存此视频处理的key
    await this.redisService.set(
      processingKey,
      UploadMessage.video_processing_01, // 开始生成视频各个分辨率的版本
    );
    const { hash } = file;
    // 1.根据hash进入用户上传视频文件夹将合并完成的视频输出为各个分辨率的临时视频文件，存储在临时视频文件夹中
    const { pList, raw } = await this.videoProcessingAPI.generateTempVideos(
      hash,
    );
    // 在redis中保存此视频处理的key
    await this.redisService.set(
      processingKey,
      UploadMessage.video_processing_02, // 开始加密各个分辨率的视频
    );
    // 2.将临时视频文件加密输出为m3u8文件
    await this.videoProcessingAPI.generateM3U8Videos(hash);
    // 2.5后台静默删除所有临时视频
    await this.videoProcessingAPI.deleteTempVideos(hash);
    // 3.获取所有分辨率的m3u8文件的相对路径
    const m3u8List = pList.map((p) => {
      return {
        path: `/${hash}/${p}/index.m3u8`,
        resolution: p,
      };
    });
    if (raw) {
      // 此视频包含了原画
      m3u8List.push({
        path: `/${hash}/raw/index.m3u8`,
        resolution: null,
      });
    }
    // 4.将这些m3u8文件信息保存在数据库中
    await Promise.all(
      m3u8List.map((item) =>
        this.fileService.createFileVideo(file, item.path, item.resolution),
      ),
    );
    // 在redis中更新此视频处理键(视频处理已经完成)
    await this.redisService.set(processingKey, "done");
  }
}
