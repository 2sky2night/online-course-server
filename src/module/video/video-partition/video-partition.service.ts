import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { VideoMessage } from "@src/config/message";
import { Account } from "@src/module/account/entity";
import { AccountService } from "@src/module/account/service";
import { VideoPartition } from "@src/module/video/video-partition/entity";
import { Repository } from "typeorm";

/**
 * 视频分区服务层
 */
@Injectable()
export class VideoPartitionService {
  /**
   * 视频分区表
   * @private
   */
  @InjectRepository(VideoPartition)
  private VPRepository: Repository<VideoPartition>;
  /**
   * 后台账户服务层
   * @private
   */
  @Inject(AccountService)
  private accountService: AccountService;

  /**
   * 创建分区
   * @param account_id 账户id
   * @param partition_name 分区名称
   */
  async addPartition(
    account_id: number,
    partition_name: string,
  ): Promise<null> {
    const account = await this.accountService.findById(account_id, true);
    if (await this.findByName(partition_name))
      throw new BadRequestException(VideoMessage.partition_name_is_exist); // 已存在此分区名
    // 创建分区
    await this.createPartition(account, partition_name);
    return null;
  }

  /**
   * 更新分区信息
   * @param account_id 账户id
   * @param partition_id 分区id
   * @param partition_name 分区名称
   */
  async updatePartition(
    account_id: number,
    partition_id: number,
    partition_name: string,
  ): Promise<null> {
    await this.accountService.findById(account_id, true);
    const partition = await this.findByIdOrFail(partition_id);
    // 查询要修改的名称是否存在
    if (await this.findByName(partition_name))
      throw new BadRequestException(VideoMessage.partition_name_is_exist); // 已存在此分区名
    // 修改分区信息
    await this.VPRepository.update(partition.partition_id, { partition_name });
    return null;
  }

  /**
   * 查询分区列表
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否根据创建时间降序排序
   */
  async list(offset: number, limit: number, desc: boolean) {
    const [list, total] = await this.VPRepository.findAndCount({
      order: { created_time: desc ? "DESC" : "ASC" },
      skip: offset,
      take: limit,
      relations: {
        account: true,
      },
    });
    return {
      list,
      total,
      has_more: total > limit + offset,
    };
  }

  /**
   * 创建一个分区
   * @param partition_name 分区名称
   * @param account 账户实例
   */
  createPartition(account: Account, partition_name: string) {
    const partition = this.VPRepository.create({ partition_name, account });
    return this.VPRepository.save(partition);
  }

  /**
   * 根据id获取分区，未获取到则报错
   * @param partition_id 分区id
   */
  async findByIdOrFail(partition_id: number) {
    const partition = await this.VPRepository.findOneBy({ partition_id });
    if (partition === null)
      throw new NotFoundException(VideoMessage.partition_not_exist);
    return partition;
  }

  /**
   * 通过分区名称，查询记录
   * @param partition_name 分区名称
   */
  findByName(partition_name: string) {
    return this.VPRepository.findOneBy({ partition_name });
  }

  /**
   * 查询分区详情
   * @param partition_id
   */
  async info(partition_id: number) {
    const item = await this.VPRepository.findOne({
      where: { partition_id },
      relations: {
        account: true,
      },
    });
    if (item) {
      return item;
    }
    throw new NotFoundException(VideoMessage.partition_not_exist);
  }
}
