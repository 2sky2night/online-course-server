import { Inject, Injectable } from "@nestjs/common";
import { Folder } from "@src/lib/folder";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountUpload } from "@src/module/upload/entity";
import { Repository } from "typeorm";
import { AccountService } from "@src/module/account/service";
import { generateFileHash } from "@src/utils/tools";
import { FileService } from "@src/module/file/service";
import { File } from "@src/module/file/entity";
import { FileType } from "@src/module/file/enum";

@Injectable()
export class UploadVideoService {
  /**
   * 目录API:上传视频
   * @private
   */
  @Inject("UPLOAD_VIDEO")
  private videoFolder: Folder;
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
