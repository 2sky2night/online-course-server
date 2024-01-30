import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { VideoCollection } from "@src/module/video/video-collection/entity";
import { Repository } from "typeorm";
import { VideoMessage } from "@src/config/message";
import { AccountService } from "@src/module/account/service";
import { VideoService } from "@src/module/video/video/video.service";
import { CreateVideoCollectionDto } from "@src/module/video/video-collection/dto";
import { Account } from "@src/module/account/entity";
import { Video } from "@src/module/video/video/entity";

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
   * @param video_id_list
   */
  async publishCollection(
    accountId: number,
    { collection_name, description, video_id_list }: CreateVideoCollectionDto,
  ) {
    const account = await this.accountService.findById(accountId, true);
    if (video_id_list) {
      // 添加了视频
      // 查询选择视频是否为自己发布的视频
      const videos = await Promise.all(
        video_id_list.map((id) => this.videoService.findById(id, true)),
      );
      const flag = await this.videoService.isVideosOwner(account, videos);
      if (flag === false) {
        // 有视频非当前用户上传
        throw new BadRequestException(VideoMessage.video_is_not_owner);
      }
      // 创建合集
      await this.create(account, collection_name, description, videos);
      return null;
    } else {
      // 未添加视频
      await this.create(account, collection_name, description);
      return null;
    }
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
    const dbVideos = await collection.videos;
    const flag = videos.some((item) => {
      return dbVideos.some((v) => v.video_id === item.video_id);
    });
    if (flag) {
      throw new BadRequestException(VideoMessage.collection_has_video);
    }
    // 添加视频
    await this.addVideosRelation(collection, videos);
    return null;
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
   */
  async updateInfo(
    accountId: number,
    collectionId: number,
    name?: string,
    description?: string,
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
    await this.VCRepository.update(collection.collection_id, updateData);
    return null;
  }

  /**
   * 获取合集信息
   * @param collection_id 合集id
   */
  async info(collection_id: number) {
    const collection = await this.findById(collection_id, true);
    return {
      ...collection,
      creator: await collection.creator,
    };
  }

  /**
   * 视频合集列表
   * @param offset 偏移量
   * @param limit 长度
   */
  async list(offset: number, limit: number) {
    const [list, total] = await this.VCRepository.findAndCount({
      skip: offset,
      take: limit,
    });
    return {
      list,
      total,
      has_more: total > limit + offset,
    };
  }

  /**
   * 当前用户是否为这些合集的创建者
   * @param account 用户
   * @param collections 视频合集
   */
  async isCollectionsOwner(account: Account, collections: VideoCollection[]) {
    for (let i = 0; i < collections.length; i++) {
      const collection = collections[i];
      const flag = await this.isCollectionOwner(account, collection);
      if (flag === false) {
        return false;
      }
    }
    return true;
  }

  /**
   * 从视频合集中移除视频
   * @param collection 视频合集
   * @param videos 视频
   */
  async removeVideosRelation(collection: VideoCollection, videos: Video[]) {
    const dbVideos = await collection.videos;
    collection.videos = Promise.resolve(
      dbVideos.filter((video) => {
        return (
          videos.some((item) => item.video_id === video.video_id) === false
        );
      }),
    );
    return this.VCRepository.save(collection);
  }

  /**
   * 将视频添加到视频合集中
   * @param collection 视频合集
   * @param videos 视频
   */
  async addVideosRelation(collection: VideoCollection, videos: Video[]) {
    const dbVideos = await collection.videos;
    collection.videos = Promise.resolve([...dbVideos, ...videos]);
    return this.VCRepository.save(collection);
  }

  /**
   * 创建视频合集
   * @param account 发布者
   * @param collection_name 合集名称
   * @param videos 视频列表，在创建时就会建立关系
   * @param description 合集描述
   */
  async create(
    account: Account,
    collection_name: string,
    description?: string,
    videos?: Video[],
  ) {
    const collection = this.VCRepository.create(
      description
        ? {
            collection_name,
            description,
          }
        : { collection_name },
    );
    collection.creator = Promise.resolve(account);
    if (videos && videos.length) {
      // 在合集中添加视频
      collection.videos = Promise.resolve(videos);
    }
    return this.VCRepository.save(collection);
  }

  /**
   * 此合集是否为当前用户创建的？
   * @param account 用户
   * @param collection 合集
   */
  async isCollectionOwner(account: Account, collection: VideoCollection) {
    const creator = await collection.creator;
    return creator.account_id === account.account_id;
  }

  /**
   * 这些视频是否包含在合集中？
   * @param collection 合集
   * @param videos 视频
   */
  async hasVideos(collection: VideoCollection, videos: Video[]) {
    const dbVideos = await collection.videos;
    return videos.every((video) => {
      return dbVideos.some((item) => {
        return item.video_id === video.video_id;
      });
    });
  }
}
