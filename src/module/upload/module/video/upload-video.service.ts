import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Folder } from "@src/lib/folder";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountUpload } from "@src/module/upload/entity";
import { Repository } from "typeorm";
import { generateFileHash } from "@src/utils/tools";
import { AccountService } from "@src/module/account/service";
import { FileType } from "@src/module/upload/enum";
import { UploadMessage } from "@src/config/message";

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
   * 老师上传视频
   * @param accountId 上传者
   * @param file 直接上传
   * @deprecated
   */
  async uploadVideo(accountId: number, file: Express.Multer.File) {
    // 计算文件hash
    const hash = generateFileHash(file.buffer);
    // 查询此文件是否存储过(在文件系统中是否存储了)
    const file_path = this.videoFolder.inFilename(hash, true);
    if (file_path === null) {
      // 此文件不存在，则保存
      const new_file_path = await this.videoFolder.addFileWithHash(
        file.originalname,
        hash,
        file.buffer,
      );
      // 保存上传记录
      const trace = await this.createTrace(accountId, hash, new_file_path);
      return {
        trace_id: trace.trace_id,
        url: new_file_path,
      };
    } else {
      // 文件存在，直接保存上传记录
      const trace = await this.createTrace(accountId, hash, file_path);
      return {
        trace_id: trace.trace_id,
        url: file_path,
      };
    }
  }

  /**
   * 记录上传文件记录
   * @param accountId 上传者
   * @param hash 文件hash值
   * @param file_path 文件存储的相对路径
   */
  async createTrace(accountId: number, hash: string, file_path: string) {
    // 查询上传者
    const account = await this.accountService.findById(accountId);
    const trace = this.AURepository.create({
      hash,
      file_path,
      file_type: FileType.VIDEO,
    });
    trace.uploader = Promise.resolve(account);
    return this.AURepository.save(trace);
  }

  /**
   * 查询某个上传记录
   * @param trace_id 上传记录id
   * @param needFind 是否必须找到
   */
  async findById(trace_id: number, needFind = false) {
    const trace = await this.AURepository.findOneBy({ trace_id });
    if (needFind && trace === null) {
      throw new NotFoundException(UploadMessage.trace_not_exists);
    }
    return trace;
  }
}
