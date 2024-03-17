import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { VideoCollection } from "@src/module/video/video-collection/entity";
import { VideoMessage } from "@src/config/message";
import { AccountService } from "@src/module/account/service";
import { VideoService } from "@src/module/video/video/video.service";
import { CreateVideoCollectionDto } from "@src/module/video/video-collection/dto";
import { Account } from "@src/module/account/entity";
import { Video } from "@src/module/video/video/entity";
import { VideoPartitionService } from "@src/module/video/video-partition/video-partition.service";
import { VideoPartition } from "@src/module/video/video-partition/entity";
import { VideoTag } from "@src/module/video/video-tag/entity";
import { VideoTagService } from "@src/module/video/video-tag/video-tag.service";

@Injectable()
export class VideoCollectionService {
  /**
   * 视频合集模型
   */
  @InjectRepository(VideoCollection)
  private VCRepository: Repository<VideoCollection>;
  /**
   * 账户服务层
   * @private
   */
  @Inject(AccountService)
  private accountService: AccountService;
  /**
   * 视频服务层
   * @private
   */
  @Inject(forwardRef(() => VideoService))
  private videoService: VideoService;
  /**
   * 视频分区服务层
   * @private
   */
  @Inject(VideoPartitionService)
  private VPService: VideoPartitionService;
  /**
   * 视频标签服务层
   * @private
   */
  @Inject(VideoTagService)
  private videoTagService: VideoTagService;

  /**
   * 查询视频合集
   * @param collection_id 视频合集id
   * @param needFind 是否必须找到
   */
  async findById(collection_id: number, needFind = false) {
    const collection = await this.VCRepository.findOneBy({ collection_id });
    if (needFind && collection === null) {
      throw new NotFoundException(VideoMessage.collection_not_exist);
    }
    return collection;
  }

  /**
   * 发布视频合集
   * @param accountId
   * @param collection_name
   * @param description
   * @param collection_cover
   * @param video_id_list
   * @param partition_id
   * @param tag_id_list
   */
  async publishCollection(
    accountId: number,
    {
      collection_name,
      description,
      video_id_list,
      collection_cover,
      partition_id,
      tag_id_list,
    }: CreateVideoCollectionDto,
  ) {
    // 账户信息
    const account = await this.accountService.findById(accountId, true);
    // 合集所属的分区
    let partition: VideoPartition | null = null;
    // 合集下的视频
    let videos: Video[] = [];
    // 视频合集实例
    let collection: VideoCollection | null = null;
    // 标签实例
    let tags: VideoTag[] = [];
    // 若选择将合集设置在某个分区下
    if (partition_id) {
      partition = await this.VPService.findByIdOrFail(partition_id); // 查询分区信息
    }
    // 若将视频添加到新合集中（对视频进行验证）
    if (video_id_list && video_id_list.length) {
      // 添加了视频
      // 查询选择视频是否为自己发布的视频
      videos = await Promise.all(
        video_id_list.map((id) => this.videoService.findById(id, true)),
      );
      const flag = await this.videoService.isVideosOwner(account, videos);
      if (flag === false) {
        // 有视频非当前用户上传
        throw new BadRequestException(VideoMessage.video_is_not_owner);
      }
    }
    // 若需要给新合集添加标签(对标签进行验证)
    if (tag_id_list && tag_id_list.length) {
      tags = await this.videoTagService.findTagsById(tag_id_list);
    }
    // 未添加视频
    collection = await this.create(
      account,
      collection_name,
      description,
      collection_cover,
      videos,
      partition,
    );
    // 给新合集添加标签
    if (tag_id_list && tag_id_list.length) {
      await this.videoTagService.addCollectionTags(collection, tags);
    }
    return null;
  }

  /**
   * 在合集中添加视频
   * @param account_id 账户id
   * @param video_id_list 视频id列表
   * @param collection_id 合集id
   */
  async addVideos(
    account_id: number,
    video_id_list: number[],
    collection_id: number,
  ): Promise<null> {
    const account = await this.accountService.findById(account_id, true);
    const collection = await this.findById(collection_id, true);
    // 1.校验此合集是否为当前用户创建
    if ((await this.isCollectionOwner(account, collection)) === false) {
      // 非合集创建者
      throw new BadRequestException(VideoMessage.collection_is_not_owner);
    }
    // 获取所有视频信息
    const videos = await Promise.all(
      video_id_list.map((id) => this.videoService.findById(id, true)),
    );
    // 2.校验这些视频是否为当前用户发布
    if ((await this.videoService.isVideosOwner(account, videos)) === false) {
      // 有视频非本人发布
      throw new BadRequestException(VideoMessage.video_is_not_owner);
    }
    // 3.校验视频合集中是否存在这些视频
    const rawCollection = await this.VCRepository.findOne({
      where: { collection_id: collection.collection_id },
      relations: ["videos"],
    });
    const flag = videos.some((item) => {
      return rawCollection.videos.some((v) => v.video_id === item.video_id);
    });
    if (flag) {
      throw new BadRequestException(VideoMessage.collection_has_video);
    }
    // 添加视频
    await this.addVideosRelation(collection, videos);
    return null;
  }

  /**
   * 更新合集所属的分区
   * @param account_id 账户id
   * @param collection_id 合集id
   * @param partition_id 分区id
   */
  async updatePartition(
    account_id: number,
    collection_id: number,
    partition_id: number,
  ): Promise<null> {
    const account = await this.accountService.findById(account_id, true);
    const partition = await this.VPService.findByIdOrFail(partition_id);
    const collection = await this.VCRepository.findOne({
      where: { collection_id },
      relations: { partition: true, creator: true },
    });
    if (collection === null) {
      // 合集不存在
      throw new NotFoundException(VideoMessage.collection_not_exist);
    }
    if (collection.creator.account_id !== account.account_id) {
      // 非合集创作者
      throw new BadRequestException(VideoMessage.collection_is_not_owner);
    }
    if (
      collection.partition !== null &&
      collection.partition.partition_id === partition.partition_id
    ) {
      // 目标分区与当前合集分区一致
      throw new BadRequestException(
        VideoMessage.update_video_collection_partition_error,
      );
    }
    // 更新合集
    await this.VCRepository.update(collection.collection_id, { partition });
    return null;
  }

  /**
   * 获取此分区下的视频合集
   * @param partition_id 分区id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否根据视频创建时间降序
   */
  async partitionList(
    partition_id: number,
    offset: number,
    limit: number,
    desc: boolean,
  ) {
    const partition = await this.VPService.findByIdOrFail(partition_id);
    const [list, total] = await this.VCRepository.createQueryBuilder(
      "collection",
    )
      .where("collection.partition_id = :partition_id", {
        partition_id: partition.partition_id,
      })
      .orderBy("collection.created_time", desc ? "DESC" : "ASC")
      .skip(offset)
      .take(limit)
      .getManyAndCount();
    return {
      list,
      total,
      has_more: total > limit + offset,
    };
  }

  /**
   * 在合集中移除视频
   * @param account_id
   * @param video_id_list
   * @param collection_id
   */
  async deleteVideos(
    account_id: number,
    video_id_list: number[],
    collection_id: number,
  ) {
    const account = await this.accountService.findById(account_id, true);
    const collection = await this.findById(collection_id, true);
    // 是否是合集创建者
    if ((await this.isCollectionOwner(account, collection)) === false) {
      throw new BadRequestException(VideoMessage.collection_is_not_owner);
    }
    const videos = await Promise.all(
      video_id_list.map((id) => this.videoService.findById(id)),
    );
    // 查询这些视频是否在合集中?
    if ((await this.hasVideos(collection, videos)) === false) {
      throw new BadRequestException(VideoMessage.collection_has_not_video);
    }
    await this.removeVideosRelation(collection, videos);
    return null;
  }

  /**
   * 更新合集信息
   * @param accountId 账户id
   * @param collectionId 合集id
   * @param name 合集名称
   * @param description 合集描述
   * @param collection_cover 合集封面
   */
  async updateInfo(
    accountId: number,
    collectionId: number,
    name?: string,
    description?: string,
    collection_cover?: string,
  ) {
    const account = await this.accountService.findById(accountId, true);
    const collection = await this.findById(collectionId, true);
    if ((await this.isCollectionOwner(account, collection)) === false) {
      // 非本人创建的合集
      throw new BadRequestException(VideoMessage.collection_is_not_owner);
    }
    // 更新视频合集信息
    const updateData: Record<string, string> = {};
    if (name) updateData.collection_name = name;
    if (description) updateData.description = description;
    if (collection_cover) updateData.collection_cover = collection_cover;
    await this.VCRepository.update(collection.collection_id, updateData);
    return null;
  }

  /**
   * 获取合集信息
   * @param collection_id 合集id
   */
  async info(collection_id: number) {
    const collection = await this.VCRepository.findOne({
      relations: ["creator", "creator"],
      where: { collection_id },
    });
    if (collection === null) {
      throw new NotFoundException(VideoMessage.collection_not_exist);
    }
    return collection;
  }

  /**
   * 视频合集列表
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否按照创建时间降序
   */
  async list(offset: number, limit: number, desc: boolean) {
    const [list, total] = await this.VCRepository.findAndCount({
      skip: offset,
      take: limit,
      relations: ["creator"],
      order: {
        created_time: desc ? "desc" : "asc",
      },
    });
    return {
      list,
      total,
      has_more: total > limit + offset,
    };
  }

  /**
   * 给合集添加标签
   * @param account_id 账户id
   * @param collection_id 合集id
   * @param tag_id_list 标签id
   */
  async addTags(
    account_id: number,
    collection_id: number,
    tag_id_list: number[],
  ): Promise<null> {
    const account = await this.accountService.findById(account_id, true);
    const collection = await this.findById(collection_id, true);
    // 查询合集是否为当前用户创建
    if ((await this.isCollectionOwner(account, collection)) === false) {
      // 非合集创建者
      throw new BadRequestException(VideoMessage.collection_is_not_owner);
    }
    const tags = await this.videoTagService.findTagsById(tag_id_list);
    // 查询合集是否已经包含这些标签了
    if (
      await this.videoTagService.checkCollectionTags(
        collection_id,
        tag_id_list,
        false,
      )
    ) {
      // 此视频合集已经包含其中的标签了
      throw new BadRequestException(VideoMessage.add_collection_tags_error);
    }
    await this.videoTagService.addCollectionTags(collection, tags);
    return null;
  }

  /**
   * 移除视频合集的标签
   * @param account_id 账户id
   * @param collection_id 合集id
   * @param tag_id_list 标签id列表
   */
  async removeTags(
    account_id: number,
    collection_id: number,
    tag_id_list: number[],
  ): Promise<null> {
    const account = await this.accountService.findById(account_id, true);
    const collection = await this.VCRepository.createQueryBuilder("collection")
      .where("collection.collection_id = :collection_id", { collection_id })
      .leftJoinAndSelect("collection.tagRelation", "relation")
      .leftJoinAndSelect("relation.tag", "tag")
      .getOne();
    if (collection === null) {
      // 合集不存在
      throw new NotFoundException(VideoMessage.collection_not_exist);
    }
    if ((await this.isCollectionOwner(account, collection)) === false) {
      // 非合集创建者
      throw new BadRequestException(VideoMessage.collection_is_not_owner);
    }
    // 查询这些标签是否存在
    await this.videoTagService.findTagsById(tag_id_list);
    // 查询合集是否拥有这些标签
    if (
      (await this.videoTagService.checkCollectionTags(
        collection_id,
        tag_id_list,
        true,
      )) === false
    ) {
      // 合集不包含这些标签
      throw new BadRequestException(VideoMessage.remove_collection_tags_error);
    }
    // 过滤出需要删除的关系
    const relation = collection.tagRelation.filter((relation) => {
      return tag_id_list.includes(relation.tag.tag_id);
    });
    // 删除合集与标签的关系
    await this.videoTagService.removeCollectionTags(relation);
    return null;
  }

  /**
   * 当前用户是否为这些合集的创建者
   * @param account 用户
   * @param collections 视频合集
   */
  async isCollectionsOwner(account: Account, collections: VideoCollection[]) {
    const result = await this.VCRepository.find({
      where: {
        collection_id: In(collections.map((item) => item.collection_id)),
      },
      relations: { creator: true },
    });
    return result.every(
      (item) => item.creator.account_id === account.account_id,
    );
  }

  /**
   * 从视频合集中移除视频
   * @param collection 视频合集
   * @param videos 视频
   */
  async removeVideosRelation(collection: VideoCollection, videos: Video[]) {
    const rawCollection = await this.VCRepository.findOne({
      where: { collection_id: collection.collection_id },
      relations: ["videos"],
    });
    collection.videos = rawCollection.videos.filter((video) => {
      return videos.some((item) => item.video_id === video.video_id) === false;
    });

    return this.VCRepository.save(collection);
  }

  /**
   * 将视频添加到视频合集中
   * @param collection 视频合集
   * @param videos 视频
   */
  async addVideosRelation(collection: VideoCollection, videos: Video[]) {
    const rawCollection = await this.VCRepository.findOne({
      where: { collection_id: collection.collection_id },
      relations: ["videos"],
    });
    collection.videos = [...rawCollection.videos, ...videos];
    return this.VCRepository.save(collection);
  }

  /**
   * 创建视频合集
   * @param account 发布者
   * @param collection_name 合集名称
   * @param description 合集描述
   * @param collection_cover 视频封面
   * @param videos 视频列表，在创建时就会建立关系
   * @param partition 视频分区
   */
  async create(
    account: Account,
    collection_name: string,
    description?: string,
    collection_cover?: string,
    videos?: Video[],
    partition?: VideoPartition,
  ) {
    const collection = this.VCRepository.create({ collection_name });
    collection.creator = account;
    if (videos && videos.length) {
      // 在合集中添加视频
      collection.videos = videos;
    }
    if (description) collection.description = description;
    if (collection_cover) collection.collection_cover = collection_cover;
    if (partition) collection.partition = partition;
    return this.VCRepository.save(collection);
  }

  /**
   * 此合集是否为当前用户创建的？
   * @param account 用户
   * @param collection 合集
   */
  async isCollectionOwner(account: Account, collection: VideoCollection) {
    const rawCollection = await this.VCRepository.findOne({
      where: { collection_id: collection.collection_id },
      relations: ["creator"],
    });
    return rawCollection.creator.account_id === account.account_id;
  }

  /**
   * 这些视频是否包含在合集中？
   * @param collection 合集
   * @param videos 视频
   */
  async hasVideos(collection: VideoCollection, videos: Video[]) {
    const rawCollection = await this.VCRepository.findOne({
      where: { collection_id: collection.collection_id },
      relations: ["videos"],
    });
    return videos.every((video) =>
      rawCollection.videos.some((i) => i.video_id === video.video_id),
    );
  }
}
