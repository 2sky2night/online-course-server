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
import { Video } from "@src/module/video/video/entity";
import { VideoCollection } from "@src/module/video/video-collection/entity";
import {
  VideoCollectionRelationTag,
  VideoRelationTag,
  VideoTag,
} from "@src/module/video/video-tag/entity";
import { In, Repository } from "typeorm";

/**
 * 视频标签服务层
 */
@Injectable()
export class VideoTagService {
  /**
   * 视频标签模型
   * @private
   */
  @InjectRepository(VideoTag)
  private videoTagRepository: Repository<VideoTag>;
  /**
   * 视频与标签关系模型
   * @private
   */
  @InjectRepository(VideoRelationTag)
  private VRTRepository: Repository<VideoRelationTag>;
  /**
   * 视频合集与标签关系模型
   * @private
   */
  @InjectRepository(VideoCollectionRelationTag)
  private VCRTRepository: Repository<VideoCollectionRelationTag>;
  /**
   * 账户服务层
   * @private
   */
  @Inject(AccountService)
  private accountService: AccountService;

  /**
   * 查询某个分区下的视频
   * @param tag_id 标签id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否降序
   */
  async videoList(
    tag_id: number,
    offset: number,
    limit: number,
    desc: boolean,
  ) {
    const tag = await this.findTagByIdOrFail(tag_id);
    const [list, total] = await this.VRTRepository.createQueryBuilder(
      "relation",
    )
      .where("relation.tag_id = :tag_id", { tag_id: tag.tag_id })
      .leftJoinAndSelect("relation.video", "video")
      .orderBy("video.created_time", desc ? "DESC" : "ASC")
      .skip(offset)
      .take(limit)
      .getManyAndCount();
    return {
      list: list.map((relation) => relation.video),
      total,
      has_more: total > limit + offset,
    };
  }

  /**
   * 查询某个分区下的视频合集
   * @param tag_id 标签id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否降序
   */
  async collectionList(
    tag_id: number,
    offset: number,
    limit: number,
    desc: boolean,
  ) {
    const tag = await this.findTagByIdOrFail(tag_id);
    const [list, total] = await this.VCRTRepository.createQueryBuilder(
      "relation",
    )
      .where("relation.tag_id = :tag_id", { tag_id: tag.tag_id })
      .leftJoinAndSelect("relation.collection", "collection")
      .orderBy("collection.created_time", desc ? "DESC" : "ASC")
      .skip(offset)
      .take(limit)
      .getManyAndCount();
    return {
      list: list.map((relation) => relation.collection),
      total,
      has_more: total > limit + offset,
    };
  }

  /**
   * 查询所有标签
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否降序
   */
  async list(offset: number, limit: number, desc: boolean) {
    const [list, total] = await this.videoTagRepository.findAndCount({
      skip: offset,
      take: limit,
      order: { created_time: desc ? "DESC" : "ASC" },
    });
    return {
      list,
      total,
      has_more: total > limit + offset,
    };
  }

  /**
   * 添加一个标签
   * @param tag_name 标签名
   * @param account_id 账户id
   */
  async addTag(tag_name: string, account_id: number): Promise<null> {
    const account = await this.accountService.findById(account_id, true);
    if (await this.findTagByName(tag_name))
      throw new BadRequestException(VideoMessage.tag_name_is_exist); // 标签名重复
    // 创建标签
    await this.createTag(tag_name, account);
    return null;
  }

  /**
   * 更新标签信息
   * @param tag_name 标签名称
   * @param tag_id 标签id
   * @param account_id 账户id
   */
  async updateTag(
    tag_name: string,
    tag_id: number,
    account_id: number,
  ): Promise<null> {
    await this.accountService.findById(account_id, true);
    const tag = await this.findTagByIdOrFail(tag_id);
    const flag = await this.findTagByName(tag_name);
    if (flag === null) {
      // 名称未重复，更新标签名称
      await this.videoTagRepository.update(tag.tag_id, { tag_name });
      return null;
    } else {
      // 名称重复了
      if (flag.tag_id === tag.tag_id) {
        throw new BadRequestException(VideoMessage.update_tag_name_error); // 名称与当前要修改的标签一致
      } else {
        throw new BadRequestException(VideoMessage.tag_name_is_exist); // 已经存在此名称的标签
      }
    }
  }

  /**
   * 创建标签
   * @param tag_name 标签名
   * @param account 账户实例
   */
  createTag(tag_name: string, account: Account) {
    const tag = this.videoTagRepository.create({ tag_name, account });
    return this.videoTagRepository.save(tag);
  }

  /**
   * 根据id查询标签，未查询到则报错
   * @param tag_id 标签id
   */
  async findTagByIdOrFail(tag_id: number) {
    const tag = await this.videoTagRepository.findOneBy({ tag_id });
    if (tag === null) throw new NotFoundException(VideoMessage.tag_not_exist);
    return tag;
  }

  /**
   * 根据名称查询标签
   * @param tag_name 标签名称
   */
  findTagByName(tag_name: string) {
    return this.videoTagRepository.findOneBy({ tag_name });
  }

  /**
   * 查询这些标签是否存在
   * @param tag_id_list 标签id列表
   */
  async findTagsById(tag_id_list: number[]) {
    const tags = await this.videoTagRepository.findBy({
      tag_id: In(tag_id_list),
    });
    if (tags.length === tag_id_list.length) {
      return tags;
    } else {
      throw new NotFoundException(VideoMessage.tag_not_exist);
    }
  }

  /**
   * 查询此视频是否包含了这些标签
   * @param video_id 视频id
   * @param tag_id_list 标签id列表
   * @param every 视频拥有所有这些标签或视频拥有部分标签(真:every|假:some)
   */
  async checkVideoTags(
    video_id: number,
    tag_id_list: number[],
    every: boolean,
  ) {
    const result = await this.VRTRepository.createQueryBuilder("relation")
      .where("relation.video_id = :video_id", { video_id })
      .leftJoinAndSelect("relation.tag", "tag")
      .getMany();
    const tags = result.map((item) => item.tag.tag_id);
    if (every) {
      return tag_id_list.every((tag_id) => tags.includes(tag_id));
    } else {
      return tag_id_list.some((tag_id) => tags.includes(tag_id));
    }
  }

  /**
   * 给视频添加标签
   * @param video 视频实例
   * @param tags 标签实例列表
   */
  addVideoTags(video: Video, tags: VideoTag[]) {
    const relation = tags.map((tag) => {
      return this.VRTRepository.create({
        tag,
        video,
      });
    });
    return this.VRTRepository.save(relation);
  }

  /**
   * 软删除视频与标签的关系
   * @param relation 关系列表
   */
  removeVideoTags(relation: VideoRelationTag[]) {
    return this.VRTRepository.softRemove(relation);
  }

  /**
   * 给合集添加标签
   * @param collection 视频合集
   * @param tags 标签
   */
  addCollectionTags(collection: VideoCollection, tags: VideoTag[]) {
    const relation = tags.map((tag) => {
      return this.VCRTRepository.create({
        tag,
        collection,
      });
    });
    return this.VCRTRepository.save(relation);
  }

  /**
   * 查询合集是否包含了这些标签
   * @param collection_id 合集id
   * @param tag_id_list 标签id列表
   * @param every 合集是否包含了以上所有的标签|合集至少只包含了其中部分的标签
   */
  async checkCollectionTags(
    collection_id: number,
    tag_id_list: number[],
    every: boolean,
  ) {
    // 查询此合集所有的标签
    const relation = await this.VCRTRepository.createQueryBuilder("relation")
      .where("relation.collection_id = :collection_id", { collection_id })
      .leftJoinAndSelect("relation.tag", "tag")
      .getMany();
    // 此合集所有的标签id
    const all_id = relation.map((item) => item.tag.tag_id);
    if (every) {
      // 所有标签都在此合集中
      return tag_id_list.every((tag_id) => all_id.includes(tag_id));
    } else {
      // 至少有部分标签存在此合集中
      return tag_id_list.some((tag_id) => all_id.includes(tag_id));
    }
  }

  /**
   * 软删除视频合集与标签的关系
   * @param relation 关系列表
   */
  removeCollectionTags(relation: VideoCollectionRelationTag[]) {
    return this.VCRTRepository.softRemove(relation);
  }
}
