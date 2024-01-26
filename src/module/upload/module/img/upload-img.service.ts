import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountUpload, UserUpload } from "@src/module/upload/entity";
import { Folder } from "@src/lib/folder";
import { generateFileHash } from "@src/utils/tools";
import { UserService } from "@src/module/user/service";
import { Repository } from "typeorm";
import { AccountService } from "@src/module/account/service";
import { FileType } from "@src/module/upload/enum";

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
   * 前台用户上传头像
   * @param userId 上传者
   * @param file 上传的文件数据
   */
  async uploadUserAvatar(userId: number, file: Express.Multer.File) {
    // 计算文件的hash
    const hash = generateFileHash(file.buffer);
    // 查询文件是否存储过
    const file_path = this.userAvatarFolder.inFilename(hash, true);
    if (file_path === null) {
      // 未存储过此文件，存储文件
      const new_file_path = await this.userAvatarFolder.addFileWithHash(
        file.originalname,
        hash,
        file.buffer,
      );
      // 保存上传记录
      await this.createUserTrace(userId, hash, new_file_path);
      return {
        url: new_file_path,
      };
    } else {
      // 存储过此文件了，直接记录上传记录
      await this.createUserTrace(userId, hash, file_path);
      return {
        url: file_path,
      };
    }
  }

  /**
   * 后台用户上传头像
   * @param accountId 上传者
   * @param file 文件
   */
  async uploadAccountAvatar(accountId: number, file: Express.Multer.File) {
    // 生成文件的hash
    const hash = generateFileHash(file.buffer);
    // 查询此文件是否存储过了
    const file_path = this.accountAvatarFolder.inFilename(hash, true);
    if (file_path === null) {
      // 未存储过此文件，存储文件
      const new_file_path = await this.accountAvatarFolder.addFileWithHash(
        file.originalname,
        hash,
        file.buffer,
      );
      // 保存上传记录
      await this.createAccountTrace(accountId, hash, new_file_path);
      return {
        url: new_file_path,
      };
    } else {
      // 存储过文件，直接保存上传记录
      await this.createAccountTrace(accountId, hash, file_path);
      return {
        url: file_path,
      };
    }
  }

  /**
   * 创建后台用户上传资源追踪记录
   * @param accountId 账户id
   * @param hash 文件哈希
   * @param file_path 文件路径
   */
  async createAccountTrace(accountId: number, hash: string, file_path: string) {
    const account = await this.accountService.findById(accountId, true);
    const trace = this.AURepository.create({
      hash,
      file_path,
      file_type: FileType.IMAGE,
    });
    trace.uploader = Promise.resolve(account);
    return this.AURepository.save(trace);
  }

  /**
   * 创建前台用户上传资源追踪记录
   * @param userId 用户id
   * @param hash 文件哈希
   * @param file_path 文件路径
   */
  async createUserTrace(userId: number, hash: string, file_path: string) {
    const user = await this.userService.findByUID(userId);
    const trace = this.UURepository.create({
      hash,
      file_path,
    });
    trace.uploader = Promise.resolve(user);
    return this.UURepository.save(trace);
  }
}
