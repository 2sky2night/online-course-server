import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountUpload, UserUpload } from "@src/module/upload/entity";
import { Folder } from "@src/lib/folder";
import { generateFileHash } from "@src/utils/tools";
import { UserService } from "@src/module/user/service";
import { Repository } from "typeorm";
import { AccountService } from "@src/module/account/service";
import { FileService } from "@src/module/file/service";
import { FileType } from "@src/module/file/enum";
import { File } from "@src/module/file/entity";

@Injectable()
export class UploadImgService {
  /**
   * 目录API:上传前台用户头像
   */
  @Inject("UPLOAD_USER_AVATAR")
  userAvatarFolder: Folder;
  /**
   * 目录API:上传后台用户头像
   */
  @Inject("UPLOAD_ACCOUNT_AVATAR")
  accountAvatarFolder: Folder;
  /**
   * 前台账户追踪表
   * @private
   */
  @InjectRepository(UserUpload)
  private UURepository: Repository<UserUpload>;
  /**
   * 后台账户上传追踪表
   * @private
   */
  @InjectRepository(AccountUpload)
  private AURepository: Repository<AccountUpload>;
  /**
   * 前台用户服务层
   */
  @Inject(UserService)
  userService: UserService;
  /**
   * 后台用户服务层
   */
  @Inject(AccountService)
  accountService: AccountService;
  /**
   * 文件服务层
   */
  @Inject(FileService)
  fileService: FileService;

  /**
   * 前台用户上传头像
   * @param userId 上传者
   * @param uploadFile 上传的文件数据
   */
  async uploadUserAvatar(userId: number, uploadFile: Express.Multer.File) {
    // 计算文件hash
    const hash = generateFileHash(uploadFile.buffer);
    // 文件系统中是否存在保存此文件
    const fsFilePath = this.userAvatarFolder.inFilename(hash, true);
    if (fsFilePath) {
      // 文件系统保存过此文件了
      // 数据库中是否存在此文件的路径
      const dbFile = await this.fileService.findByPath(fsFilePath);
      if (dbFile === null) {
        // 数据库中未保存此文件，则添加新文件
        const file = await this.fileService.create(
          hash,
          fsFilePath,
          FileType.IMAGE,
        );
        // 增加上传记录
        const trace = await this.createUserTrace(userId, file);
        return this.formatTrace(trace, file);
      } else {
        // 数据库中存储了此文件记录，增加上传记录
        const trace = await this.createUserTrace(userId, dbFile);
        return this.formatTrace(trace, dbFile);
      }
    } else {
      // 文件系统未保存此文件
      // 保存文件
      const fsNewFilePath = await this.userAvatarFolder.addFileWithHash(
        uploadFile.originalname,
        hash,
        uploadFile.buffer,
      );
      // 查询数据库中是否存储了
      const dbFile = await this.fileService.findByPath(fsNewFilePath);
      if (dbFile === null) {
        // 数据库中未存储此文件,增加文件
        const file = await this.fileService.create(
          hash,
          fsNewFilePath,
          FileType.IMAGE,
        );
        // 增加上传记录
        const trace = await this.createUserTrace(userId, file);
        return this.formatTrace(trace, file);
      } else {
        // 数据库中存储过此文件了，则直接增加上传记录
        const trace = await this.createUserTrace(userId, dbFile);
        return this.formatTrace(trace, dbFile);
      }
    }
  }

  /**
   * 后台用户上传头像
   * @param accountId 上传者
   * @param uploadFile 文件
   */
  async uploadAccountAvatar(
    accountId: number,
    uploadFile: Express.Multer.File,
  ) {
    // 计算文件hash
    const hash = generateFileHash(uploadFile.buffer);
    // 查询目录中是否存在此文件
    const fsFilePath = this.accountAvatarFolder.inFilename(hash, true);
    if (fsFilePath) {
      // 文件系统保存了此文件
      // 查询数据库中是否有此记录
      const dbFile = await this.fileService.findByPath(fsFilePath);
      if (dbFile) {
        // 数据库中有此文件记录，直接添加上传记录
        const trace = await this.createAccountTrace(accountId, dbFile);
        return this.formatTrace(trace, dbFile);
      } else {
        // 数据库中无此文件记录，添加记录
        const file = await this.fileService.create(
          hash,
          fsFilePath,
          FileType.IMAGE,
        );
        // 增加上传记录
        const trace = await this.createAccountTrace(accountId, file);
        return this.formatTrace(trace, file);
      }
    } else {
      // 文件系统未保存此文件，保存新文件
      const fsNewFilePath = await this.accountAvatarFolder.addFileWithHash(
        uploadFile.originalname,
        hash,
        uploadFile.buffer,
      );
      // 查询数据库中是否保存了此文件
      const dbFile = await this.fileService.findByPath(fsNewFilePath);
      if (dbFile) {
        // 保存了，直接添加上传记录
        const trace = await this.createAccountTrace(accountId, dbFile);
        return this.formatTrace(trace, dbFile);
      } else {
        // 未保存，增加记录
        const file = await this.fileService.create(
          hash,
          fsNewFilePath,
          FileType.IMAGE,
        );
        // 添加上传记录
        const trace = await this.createAccountTrace(accountId, file);
        return this.formatTrace(trace, file);
      }
    }
  }

  /**
   * 创建后台用户上传资源追踪记录
   * @param accountId 账户id
   * @param file 上传的文件
   */
  async createAccountTrace(accountId: number, file: File) {
    const account = await this.accountService.findById(accountId, true);
    const trace = this.AURepository.create();
    trace.file = Promise.resolve(file);
    trace.uploader = Promise.resolve(account);
    return this.AURepository.save(trace);
  }

  /**
   * 创建前台用户上传资源追踪记录
   * @param userId 用户id
   * @param file 上传的文件
   */
  async createUserTrace(userId: number, file: File) {
    const user = await this.userService.findByUID(userId, true);
    const trace = this.UURepository.create();
    trace.file = Promise.resolve(file);
    trace.uploader = Promise.resolve(user);
    return this.UURepository.save(trace);
  }

  /**
   * 格式化上传记录
   * @param trace
   * @param file
   */
  formatTrace(trace: UserUpload | AccountUpload, file: File) {
    return {
      trace_id: trace.trace_id,
      file_id: file.file_id,
      url: file.file_path,
    };
  }
}
