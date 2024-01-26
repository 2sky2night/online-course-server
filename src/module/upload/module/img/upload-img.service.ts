import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountUpload, UserUpload } from "@src/module/upload/entity";
import { Folder } from "@src/lib/folder";
import { generateFileHash } from "@src/utils/tools";
import { UserService } from "@src/module/user/service";
import { Repository } from "typeorm";
import { AccountService } from "@src/module/account/service";

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
    // 查询通过文件hash是否存储了此文件
    const isExists = await this.UURepository.findOneBy({ hash });
    // 查询上传用户是否有效
    const user = await this.userService.findByUID(userId, true);
    if (isExists === null) {
      // 不存在此hash的文件 保存文件并记录用户操作
      const file_path = await this.userAvatarFolder.addFileWithHash(
        file.originalname,
        hash,
        file.buffer,
      );
      const trace = this.UURepository.create({
        hash,
        file_path,
      });
      trace.uploader = Promise.resolve(user);
      await this.UURepository.save(trace);
      // 上传成功
      return {
        url: trace.file_path,
      };
    } else {
      // 此文件已经存在，直接记录用户操作
      const trace = this.UURepository.create({
        hash,
        file_path: isExists.file_path,
      });
      trace.uploader = Promise.resolve(user);
      await this.UURepository.save(trace);
      // 秒传
      return {
        url: isExists.file_path,
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
    // 在数据库中查询此hash的文件是否上传过
    const isExists = await this.AURepository.findOneBy({ hash });
    // 查询上传者
    const account = await this.accountService.findById(accountId, true);
    if (isExists) {
      // 上传过，则增加上传记录
      const trace = this.AURepository.create({
        hash,
        file_path: isExists.file_path,
      });
      trace.uploader = Promise.resolve(account);
      await this.AURepository.save(trace);
      return {
        url: isExists.file_path,
      };
    } else {
      // 未上传过，则保存文件
      const file_path = await this.accountAvatarFolder.addFileWithHash(
        file.originalname,
        hash,
        file.buffer,
      );
      // 增加上传记录
      const trace = this.AURepository.create({ hash, file_path });
      trace.uploader = Promise.resolve(account);
      await this.AURepository.save(trace);
      return {
        url: file_path,
      };
    }
  }
}
