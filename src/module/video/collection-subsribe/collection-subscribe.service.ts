import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { VideoMessage } from "@src/config/message";
import { UserService } from "@src/module/user/service";
import { CollectionSubscribe } from "@src/module/video/collection-subsribe/entity";
import { VideoCollectionService } from "@src/module/video/video-collection/video-collection.service";
import { Repository } from "typeorm";

/**
 * 用户订阅合集服务层
 */
@Injectable()
export class CollectionSubscribeService {
  /**
   * 用户订阅合集模型
   * @private
   */
  @InjectRepository(CollectionSubscribe)
  private CSRepository: Repository<CollectionSubscribe>;
  /**
   * 用户服务层
   * @private
   */
  @Inject(UserService)
  private userService: UserService;
  /**
   * 合集服务层
   * @private
   */
  @Inject(VideoCollectionService)
  private VCService: VideoCollectionService;

  /**
   * 订阅合集
   * @param user_id 用户id
   * @param collection_id 合集id
   */
  async subscribe(user_id: number, collection_id: number): Promise<null> {
    const user = await this.userService.findByUID(user_id, true);
    const collection = await this.VCService.findById(collection_id, true);
    if (await this.findSubscribe(user.user_id, collection.collection_id)) {
      // 已经订阅过此合集了
      throw new BadRequestException(VideoMessage.subscribe_collection_error);
    }
    // 订阅合集
    const trace = this.CSRepository.create({
      user,
      collection,
    });
    await this.CSRepository.save(trace);
    return null;
  }

  /**
   * 取消订阅
   * @param user_id 用户id
   * @param collection_id 合集id
   */
  async unsubscribe(user_id: number, collection_id: number): Promise<null> {
    const user = await this.userService.findByUID(user_id, true);
    const collection = await this.VCService.findById(collection_id, true);
    const trace = await this.findSubscribe(
      user.user_id,
      collection.collection_id,
    );
    if (trace === null) {
      // 未订阅此合集，不能取消订阅
      throw new BadRequestException(VideoMessage.unsubscribe_collection_error);
    }
    // 取消订阅
    await this.CSRepository.softDelete(trace.trace_id);
    return null;
  }

  /**
   * 查询用户是否订阅过此视频合集
   * @param user_id 用户id
   * @param collection_id 合集
   */
  findSubscribe(user_id: number, collection_id: number) {
    return this.CSRepository.createQueryBuilder("sub")
      .where("sub.collection_id = :collection_id", { collection_id })
      .andWhere("sub.user_id = :user_id", { user_id })
      .getOne();
  }

  /**
   * 查看用户订阅的视频合集
   * @param user_id 用户id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否降序
   */
  async subscribeList(
    user_id: number,
    offset: number,
    limit: number,
    desc: boolean,
  ) {
    const user = await this.userService.findByUID(user_id, true);
    const [relation, total] = await this.CSRepository.createQueryBuilder("sub")
      .where("sub.user_id = :user_id", { user_id: user.user_id })
      .orderBy("sub.created_time", desc ? "DESC" : "ASC")
      .skip(offset)
      .take(limit)
      .leftJoinAndSelect("sub.collection", "collection")
      .getManyAndCount();
    const list = relation.map((item) => item.collection);
    return {
      list,
      total,
      has_more: total > limit + offset,
    };
  }
}
