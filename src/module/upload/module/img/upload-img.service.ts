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
  private userAvatarFolder: Folder;
  /**
   * 目录API:上传后台用户头像
   */
  @Inject("UPLOAD_ACCOUNT_AVATAR")
  private accountAvatarFolder: Folder;
  /**
   * 目录API:上传视频封面目录
   */
  @Inject("UPLOAD_VIDEO_COVER")
  private videoCoverFolder: Folder;
  /**
   * 目录API:上传视频合集封面目录
   */
  @Inject("UPLOAD_VIDEO_COLLECTION_COVER")
  private VCCFolder: Folder;
  /**
   * 目录API：上传视频评论配图目录
   */
  @Inject("UPLOAD_VIDEO_COMMENT")
  private videoCommentFolder: Folder;
  /**
   * 目录API:视频回复配图目录
   */
  @Inject("UPLOAD_VIDEO_REPLY")
  private videoReplyFolder: Folder;
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
  private userService: UserService;
  /**
   * 后台用户服务层
   */
  @Inject(AccountService)
  private accountService: AccountService;
  /**
   * 文件服务层
   */
  @Inject(FileService)
  private fileService: FileService;

  /**
   * 前台用户上传头像
   * @param userId 上传者
   * @param uploadFile 上传的文件数据
   */
  uploadUserAvatar(userId: number, uploadFile: Express.Multer.File) {
    return this.userTrace(
      userId,
      uploadFile,
      this.userAvatarFolder,
      FileType.IMAGE,
    );
  }

  /**
   * 后台用户上传头像
   * @param accountId 上传者
   * @param uploadFile 文件
   */
  uploadAccountAvatar(accountId: number, uploadFile: Express.Multer.File) {
    return this.accountTrace(
      accountId,
      uploadFile,
      this.accountAvatarFolder,
      FileType.IMAGE,
    );
  }

  /**
   * 后台老师上传视频封面
   * @param accountId 账号id
   * @param uploadFile 文件
   */
  uploadVideoCover(accountId: number, uploadFile: Express.Multer.File) {
    return this.accountTrace(
      accountId,
      uploadFile,
      this.videoCoverFolder,
      FileType.IMAGE,
    );
  }

  /**
   * 老师上传视频合集封面
   * @param accountId 账号id
   * @param uploadFile 文件
   */
  uploadVideoCollectionCover(
    accountId: number,
    uploadFile: Express.Multer.File,
  ) {
    return this.accountTrace(
      accountId,
      uploadFile,
      this.VCCFolder,
      FileType.IMAGE,
    );
  }

  /**
   * 用户上传视频评论配图
   * @param userId 用户id
   * @param uploadFile 上传的图片
   */
  uploadVideoComment(userId: number, uploadFile: Express.Multer.File) {
    return this.userTrace(
      userId,
      uploadFile,
      this.videoCommentFolder,
      FileType.IMAGE,
    );
  }

  /**
   * 用户上传视频回复配图
   * @param userId 用户id
   * @param uploadFile 上传的图片
   */
  uploadVideoReply(userId: number, uploadFile: Express.Multer.File) {
    return this.userTrace(
      userId,
      uploadFile,
      this.videoReplyFolder,
      FileType.IMAGE,
    );
  }

  /**
   * 增加后台上传记录
   * @param accountId 账户id
   * @param uploadFile 上传的文件
   * @param folder 目录API
   * @param fileType 文件类型
   */
  async accountTrace(
    accountId: number,
    uploadFile: Express.Multer.File,
    folder: Folder,
    fileType: FileType | null,
  ) {
    await this.accountService.findById(accountId, true);
    const hash = generateFileHash(uploadFile.buffer);
    const fsFilePath = folder.inFilename(hash, true);
    if (fsFilePath) {
      // 1.文件系统存储了此文件
      const dbFile = await this.fileService.findByPath(fsFilePath);
      if (dbFile) {
        // 1.1数据库存储了此文件记录
        // 增加上传追踪记录
        const trace = await this.createAccountTrace(accountId, dbFile);
        return this.formatTrace(trace, dbFile);
      } else {
        // 1.2数据库未存储此文件记录
        // 增加文件
        const newDbFile = await this.fileService.create(
          hash,
          fsFilePath,
          fileType,
        );
        // 增加上传追踪记录
        const trace = await this.createAccountTrace(accountId, newDbFile);
        return this.formatTrace(trace, newDbFile);
      }
    } else {
      // 2.文件系统未存储此文件
      // 保存此文件
      const fsNewfilePath = await folder.addFileWithHash(
        uploadFile.originalname,
        hash,
        uploadFile.buffer,
      );
      const dbFile = await this.fileService.findByPath(fsNewfilePath);
      if (dbFile) {
        // 2.1 数据库中保存了文件记录
        // 增加上传记录
        const trace = await this.createAccountTrace(accountId, dbFile);
        return this.formatTrace(trace, dbFile);
      } else {
        // 2.2 数据库中未保存文件记录
        // 增加文件记录
        const dbNewFile = await this.fileService.create(
          hash,
          fsNewfilePath,
          fileType,
        );
        // 增加上传记录
        const trace = await this.createAccountTrace(accountId, dbNewFile);
        return this.formatTrace(trace, dbNewFile);
      }
    }
  }

  /**
   * 增加前台上传记录
   * @param userId 用户id
   * @param uploadFile 上传的文件
   * @param folder 目录API
   * @param fileType 文件类型
   */
  async userTrace(
    userId: number,
    uploadFile: Express.Multer.File,
    folder: Folder,
    fileType: FileType | null,
  ) {
    await this.userService.findByUID(userId, true);
    const hash = generateFileHash(uploadFile.buffer);
    const fsFilePath = folder.inFilename(hash, true);
    if (fsFilePath) {
      // 1.文件系统存储了此文件
      const dbFile = await this.fileService.findByPath(fsFilePath);
      if (dbFile) {
        // 1.1数据库存储了此文件记录
        // 增加上传追踪记录
        const trace = await this.createUserTrace(userId, dbFile);
        return this.formatTrace(trace, dbFile);
      } else {
        // 1.2数据库未存储此文件记录
        // 增加文件
        const newDbFile = await this.fileService.create(
          hash,
          fsFilePath,
          fileType,
        );
        // 增加上传追踪记录
        const trace = await this.createUserTrace(userId, newDbFile);
        return this.formatTrace(trace, newDbFile);
      }
    } else {
      // 2.文件系统未存储此文件
      // 保存此文件
      const fsNewfilePath = await folder.addFileWithHash(
        uploadFile.originalname,
        hash,
        uploadFile.buffer,
      );
      const dbFile = await this.fileService.findByPath(fsNewfilePath);
      if (dbFile) {
        // 2.1 数据库中保存了文件记录
        // 增加上传记录
        const trace = await this.createUserTrace(userId, dbFile);
        return this.formatTrace(trace, dbFile);
      } else {
        // 2.2 数据库中未保存文件记录
        // 增加文件记录
        const dbNewFile = await this.fileService.create(
          hash,
          fsNewfilePath,
          fileType,
        );
        // 增加上传记录
        const trace = await this.createUserTrace(userId, dbNewFile);
        return this.formatTrace(trace, dbNewFile);
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
    trace.file = file;
    trace.uploader = account;
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
    trace.file = file;
    trace.uploader = user;
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
