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
   * 将视频添加到视频合集中
   * @param collection 视频合集
   * @param video 视频
   */
  async addVideo(collection: VideoCollection, video: Video) {
    // https://stackoverflow.com/questions/59771671/nestjs-update-many-to-many-relation-with-join-table
    const videos = await collection.videos;
    collection.videos = Promise.resolve([...videos, video]);
    const toUpdate = await this.VCRepository.preload(collection);
    return this.VCRepository.save(toUpdate);
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
}
