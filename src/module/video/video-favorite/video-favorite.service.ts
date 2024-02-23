import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  VideoFavorite,
  VideoRelationFavorite,
} from "@src/module/video/video-favorite/entity";
import { In, Repository } from "typeorm";
import { UserService } from "@src/module/user/service";
import { VideoMessage } from "@src/config/message";
import { User } from "@src/module/user/entity";
import { VideoService } from "@src/module/video/video/video.service";
import { arrayToQueryString } from "@src/utils/tools";

/**
 * 视频收藏服务层
 */
@Injectable()
export class VideoFavoriteService {
  /**
   * 视频收藏夹模型
   * @private
   */
  @InjectRepository(VideoFavorite)
  private VFRepository: Repository<VideoFavorite>;
  /**
   * 视频与收藏夹的关系模型
   * @private
   */
  @InjectRepository(VideoRelationFavorite)
  private VRFRepository: Repository<VideoRelationFavorite>;
  /**
   * 用户服务层
   * @private
   */
  @Inject(UserService)
  private userService: UserService;
  /**
   * 视频服务层
   * @private
   */
  @Inject(forwardRef(() => VideoService))
  private videoService: VideoService;

  /**
   * 创建视频收藏夹
   * @param user_id 用户id
   * @param favorite_name 收藏夹名称
   * @param description 收藏描述
   */
  async createFavorite(
    user_id: number,
    favorite_name: string,
    description: string | undefined,
  ): Promise<null> {
    const user = await this.userService.findByUID(user_id, true);
    const favorite = this.VFRepository.create({ favorite_name, user });
    if (description) favorite.description = description;
    await this.VFRepository.save(favorite);
    return null;
  }

  /**
   * 更新收藏夹信息
   * @param user_id 用户id
   * @param favorite_id 收藏夹id
   * @param favorite_name 收藏夹名称
   * @param description 收藏夹描述
   */
  async updateFavorite(
    user_id: number,
    favorite_id: number,
    favorite_name: string | undefined,
    description: string | undefined,
  ): Promise<null> {
    const user = await this.userService.findByUID(user_id, true);
    const favorite = await this.findFavoriteByIdOrFail(favorite_id, true);
    if (user.user_id !== favorite.user.user_id) {
      // 非收藏夹的创建者
      throw new BadRequestException(VideoMessage.favorite_is_not_owner);
    }
    const data: Record<string, string> = {};
    if (favorite_name) data.favorite_name = favorite_name;
    if (description) data.description = description;
    // 更新收藏夹信息
    await this.VFRepository.update(favorite.favorite_id, data);
    return null;
  }

  /**
   * 向多个收藏夹|默认收藏夹添加视频
   * @param user_id 用户id
   * @param video_id 视频id
   * @param favorite_id_list 收藏夹列表
   * @param set_default 是否收藏到默认收藏夹中
   */
  async addVideos(
    user_id: number,
    video_id: number,
    favorite_id_list: number[] | undefined,
    set_default: boolean | undefined,
  ): Promise<null> {
    const user = await this.userService.findByUID(user_id, true);
    const video = await this.videoService.findById(video_id, true);
    if (favorite_id_list?.length) {
      // 选择将视频添加到收藏夹中
      // 查询收藏夹是否都存在
      const favorites = await this.findFavoritesByIdOrFail(
        favorite_id_list,
        true,
      );
      // 查询这些收藏夹都是自己创建的
      if (this.isFavoritesOwner(favorites, user) === false) {
        // 非这些收藏夹的创建则
        throw new BadRequestException(VideoMessage.favorite_is_not_owner);
      }
      // 查询这些收藏夹是否收藏了此视频？
      const flag = await this.favoritesHasVideo(favorite_id_list, video_id);
      if (flag.length) {
        // 有收藏夹已经收藏该视频了
        throw new BadRequestException(VideoMessage.favorite_video_error);
      }
      // 创建收藏视频记录
      const traces = favorites.map((item) => {
        return this.VRFRepository.create({
          video,
          user,
          favorite: item,
        });
      });
      await this.VRFRepository.save(traces);
    }
    if (set_default) {
      // 选择将视频添加到默认收藏夹中
      const flag = await this.defaultFavoriteHasVideo(user_id, video_id);
      if (flag) {
        // 默认收藏夹已经收藏了此视频了!
        throw new BadRequestException(VideoMessage.favorite_video_error);
      }
      const trace = this.VRFRepository.create({ user, video });
      await this.VRFRepository.save(trace);
    }
    return null;
  }

  /**
   * 从视频收藏夹中移除多个视频
   * @param user_id 用户id
   * @param favorite_id 收藏夹id
   * @param video_id_list 视频id
   */
  async removeVideos(
    user_id: number,
    favorite_id: number,
    video_id_list: number[],
  ): Promise<null> {
    const user = await this.userService.findByUID(user_id, true);
    const favorite = await this.findFavoriteByIdOrFail(favorite_id, true);
    if (user.user_id !== favorite.user.user_id) {
      // 非收藏夹的创建者
      throw new BadRequestException(VideoMessage.favorite_is_not_owner);
    }
    // 查询这些视频是否有效
    const videos = await this.videoService.findByIds(video_id_list, true);
    // 从关系表中查询此收藏夹中是否存在这些视频
    const relation = await this.VRFRepository.createQueryBuilder("relation")
      .where("relation.favorite_id = :favorite_id", { favorite_id })
      .andWhere(`relation.video_id in (${arrayToQueryString(video_id_list)})`)
      .getMany();
    if (relation.length !== videos.length) {
      // 收藏夹未收藏此视频
      throw new BadRequestException(VideoMessage.remove_favorite_video_error);
    }
    await this.VRFRepository.softRemove(relation);
    return null;
  }

  /**
   * 移除默认收藏夹中多个视频
   * @param user_id 用户id
   * @param video_id_list 视频id列表
   */
  async removeDefaultVideos(user_id: number, video_id_list: number[]) {
    const user = await this.userService.findByUID(user_id, true);
    const videos = await this.videoService.findByIds(video_id_list, true);
    // 此用户的默认收藏夹是否收藏了这些视频
    const relation = await this.VRFRepository.createQueryBuilder("relation")
      .where("relation.user_id = :user_id", { user_id: user.user_id })
      .andWhere("relation.favorite_id is null")
      .andWhere(`relation.video_id in (${arrayToQueryString(video_id_list)})`)
      .getMany();
    if (relation.length !== videos.length) {
      // 收藏夹未收藏此视频
      throw new BadRequestException(VideoMessage.remove_favorite_video_error);
    }
    await this.VRFRepository.softRemove(relation);
    return null;
  }

  /**
   * 查询用户收藏夹对此视频的收藏状态
   * @param user_id
   * @param offset
   * @param limit
   * @param desc
   * @param video_id
   */
  async userFavoritesWithVideo(
    user_id: number,
    offset: number,
    limit: number,
    desc: boolean,
    video_id: number,
  ) {
    const user = await this.userService.findByUID(user_id, true);
    const video = await this.videoService.findById(video_id, true);
    // 分页查询出收藏夹
    const [favorites, total] = await this.VFRepository.createQueryBuilder(
      "favorite",
    )
      .where("favorite.user_id = :user_id", { user_id: user.user_id })
      .orderBy("favorite.created_time", desc ? "DESC" : "ASC")
      .skip(offset)
      .take(limit)
      .getManyAndCount();
    // 根据上述的收藏夹查询出包含了此视频的收藏夹
    const hasVideoFavorites = (
      await this.favoritesHasVideo(
        favorites.map((item) => item.favorite_id),
        video.video_id,
        true,
      )
    ).map((item) => item.favorite);
    // 构造出所有收藏夹对于此视频的收藏状态
    const list = favorites.map((item) => {
      return {
        ...item,
        favorite_state:
          hasVideoFavorites.findIndex(
            (f) => f.favorite_id === item.favorite_id,
          ) !== -1,
      };
    });
    // 查询默认收藏夹是否收藏了此视频？
    const defaultFavoriteState = await this.VRFRepository.createQueryBuilder(
      "relation",
    )
      .where("relation.user_id = :user_id", { user_id: user.user_id })
      .andWhere("relation.favorite_id is null")
      .getOne();

    return {
      list,
      default_state: !!defaultFavoriteState,
      total,
      has_more: total > limit + offset,
    };
  }

  /**
   * 查询用户收藏夹列表
   * @param user_id 用户id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 创建时间降序
   */
  async userFavoritesList(
    user_id: number,
    offset: number,
    limit: number,
    desc: boolean,
  ) {
    const user = await this.userService.findByUID(user_id, true);
    const [list, total] = await this.VFRepository.createQueryBuilder("favorite")
      .where("favorite.user_id = :user_id", { user_id: user.user_id })
      .orderBy("favorite.created_time", desc ? "DESC" : "ASC")
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
   * 查询收藏夹中的视频
   * @param favorite_id 收藏夹id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 排序
   */
  async favoriteVideoList(
    favorite_id: number,
    offset: number,
    limit: number,
    desc: boolean,
  ) {
    const favorite = await this.findFavoriteByIdOrFail(favorite_id, false);
    const [relation, total] = await this.VRFRepository.createQueryBuilder(
      "relation",
    )
      .where("relation.favorite_id = :favorite_id", {
        favorite_id: favorite.favorite_id,
      })
      .orderBy("relation.created_time", desc ? "DESC" : "ASC")
      .skip(offset)
      .take(limit)
      .leftJoinAndSelect("relation.video", "video")
      .getManyAndCount();
    const list = relation.map((item) => item.video);
    return {
      list,
      total,
      has_more: total > limit + offset,
    };
  }

  /**
   * 查询用户默认收藏夹中视频
   * @param user_id 用户id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 降序
   */
  async favoriteDefaultVideoList(
    user_id: number,
    offset: number,
    limit: number,
    desc: boolean,
  ) {
    const user = await this.userService.findByUID(user_id, true);
    const [relation, total] = await this.VRFRepository.createQueryBuilder(
      "relation",
    )
      .where("relation.user_id = :user_id", { user_id: user.user_id })
      .andWhere("relation.favorite_id is null")
      .orderBy("relation.created_time", desc ? "DESC" : "ASC")
      .skip(offset)
      .take(limit)
      .leftJoinAndSelect("relation.video", "video")
      .getManyAndCount();
    const list = relation.map((item) => item.video);
    return {
      list,
      total,
      has_more: total > limit + offset,
    };
  }

  /**
   * 通过id查询收藏夹，未找到就报错
   * @param favorite_id 收藏夹id
   * @param creator 是否加载创建者的信息
   */
  async findFavoriteByIdOrFail(favorite_id: number, creator: boolean) {
    const favorite = await this.VFRepository.findOne({
      where: { favorite_id },
      relations: creator ? { user: true } : {},
    });
    if (favorite) {
      return favorite;
    } else {
      throw new NotFoundException(VideoMessage.favorite_not_exist);
    }
  }

  /**
   * 通过id查询这些收藏夹，未找到就报错
   * @param favorite_id_list 收藏夹id
   * @param creator 是否加载创建者的信息
   */
  async findFavoritesByIdOrFail(favorite_id_list: number[], creator: boolean) {
    const favorites = await this.VFRepository.find({
      where: { favorite_id: In(favorite_id_list) },
      relations: creator ? { user: true } : {},
    });
    if (favorites.length !== favorite_id_list.length) {
      throw new NotFoundException(VideoMessage.favorite_not_exist);
    } else {
      return favorites;
    }
  }

  /**
   * 当前用户是否为这些收藏夹的创建者
   * @param favorites 收藏夹实例列表
   * @param user 用户
   */
  isFavoritesOwner(favorites: VideoFavorite[], user: User) {
    return favorites.every((item) => item.user.user_id === user.user_id);
  }

  /**
   * 查询这些收藏夹是否包含了此视频
   * @param favorite_id_list 收藏id
   * @param video_id 视频id
   * @param favorite 是否需要关联出收藏夹信息
   */
  favoritesHasVideo(
    favorite_id_list: number[],
    video_id: number,
    favorite = false,
  ) {
    const builder = this.VRFRepository.createQueryBuilder("relation")
      .where(
        `relation.favorite_id in (${arrayToQueryString(favorite_id_list)})`,
      )
      .andWhere("relation.video_id = :video_id", { video_id });
    if (favorite) {
      return builder
        .leftJoinAndSelect("relation.favorite", "favorite")
        .getMany();
    } else {
      return builder.getMany();
    }
  }

  /**
   * 查询默认收藏夹是否收藏了该视频
   * @param user_id 用户id
   * @param video_id 视频id
   */
  defaultFavoriteHasVideo(user_id: number, video_id: number) {
    return this.VRFRepository.createQueryBuilder("relation")
      .where("relation.user_id = :user_id", { user_id })
      .andWhere("relation.video_id = :video_id", { video_id })
      .andWhere("relation.favorite_id is :favorite_id", { favorite_id: null })
      .getOne();
  }

  /**
   * 查询用户是否收藏过此视频
   * @param user_id 用户id
   * @param video_id 视频id
   */
  async isStarVideo(user_id: number, video_id: number) {
    await this.userService.findByUID(user_id, true);
    await this.videoService.findById(video_id, true);
    const flag = await this.VRFRepository.createQueryBuilder("star")
      .where("star.video_id = :video_id", { video_id })
      .andWhere("star.user_id = :user_id", { user_id })
      .getOne();
    return !!flag;
  }

  /**
   * 查询视频收藏量
   * @param video_id 视频id
   */
  videoStarCount(video_id: number) {
    return this.VRFRepository.createQueryBuilder("star")
      .where("star.video_id = :video_id", { video_id })
      .getCount();
  }
}
