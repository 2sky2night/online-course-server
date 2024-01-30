import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { File } from "@src/module/file/entity";
import { Repository } from "typeorm";
import { FileType } from "@src/module/file/enum";
import { FileMessage } from "@src/config/message";
import { Account } from "@src/module/account/entity";

/**
 * 文件服务层
 */
@Injectable()
export class FileService {
  /**
   * 文件模型
   * @private
   */
  @InjectRepository(File)
  private fileRepository: Repository<File>;

  /**
   * 根据相对路径查询文件
   * @param file_path 文件相对路径
   */
  findByPath(file_path: string) {
    return this.fileRepository.findOneBy({ file_path });
  }

  /**
   * 增加文件记录
   * @param hash 文件哈希
   * @param file_path 文件路径
   * @param file_type 文件类型
   */
  create(hash: string, file_path: string, file_type: FileType | null = null) {
    const file = this.fileRepository.create({ hash, file_path, file_type });
    return this.fileRepository.save(file);
  }

  /**
   * 根据id查询文件
   * @param file_id 文件id
   * @param needFind 是否必须找到
   */
  async findById(file_id: number, needFind = false) {
    const file = await this.fileRepository.findOneBy({ file_id });
    if (needFind && file === null) {
      throw new NotFoundException(FileMessage.file_not_exist);
    }
    return file;
  }

  /**
   * 该后台账户是否上传过此文件
   * @param file 文件
   * @param account 账户
   */
  async fileAccountUploader(file: File, account: Account) {
    const rawFile = await this.fileRepository
      .createQueryBuilder("file")
      .where("file.file_id = :file_id", { file_id: file.file_id })
      .leftJoinAndSelect("file.trace_accounts", "account_upload")
      .leftJoinAndSelect("account_upload.uploader", "uploader")
      .getOne();
    return rawFile.trace_accounts.some(
      (trace) => trace.uploader.account_id === account.account_id,
    );
  }
}
