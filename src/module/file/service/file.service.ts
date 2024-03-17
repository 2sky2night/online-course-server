import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FileMessage } from "@src/config/message";
import { Account } from "@src/module/account/entity";
import { File, FileVideo } from "@src/module/file/entity";
import { FileType, VideoResolution } from "@src/module/file/enum";
import { Repository } from "typeorm";

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
   * 视频文件模型
   * @private
   */
  @InjectRepository(FileVideo)
  private FVRepository: Repository<FileVideo>;

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
   * @param relation 查询与视频源的关联关系
   */
  async findById(file_id: number, needFind = false, relation = false) {
    const file = await this.fileRepository.findOne({
      where: { file_id },
      relations: relation ? { m3u8: true } : {},
    });
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

  /**
   * 创建视频文件记录
   * @param file 与文件绑定关联
   * @param file_path 视频文件的相对路径
   * @param resolution 分辨率
   */
  createFileVideo(
    file: File,
    file_path: string,
    resolution: VideoResolution | null,
  ) {
    const video = this.FVRepository.create({ file_path, file });
    if (resolution !== null) video.resolution = resolution;
    return this.FVRepository.save(video);
  }
}
