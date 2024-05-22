import { basename } from "node:path";

import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { VideoMessage } from "@src/config/message";
import { FfmpegFolder, Folder } from "@src/lib/folder";
import { Account } from "@src/module/account/entity";
import { Roles } from "@src/module/account/module/role/enum";
import { AccountService } from "@src/module/account/service";
import { File } from "@src/module/file/entity";
import { FileType } from "@src/module/file/enum";
import { FileService } from "@src/module/file/service";
import { RedisService } from "@src/module/redis/redis.service";
import { UploadVideoService } from "@src/module/upload/module/video/upload-video.service";
import { User } from "@src/module/user/entity";
import { UserService } from "@src/module/user/service";
import { PublishVideoDto } from "@src/module/video/video/dto";
import {
  Video,
  VideoHistory,
  VideoLike,
  VideoView,
} from "@src/module/video/video/entity";
import { VideoCollection } from "@src/module/video/video-collection/entity";
import { VideoCollectionService } from "@src/module/video/video-collection/video-collection.service";
import { VideoFavoriteService } from "@src/module/video/video-favorite/video-favorite.service";
import { VideoPartition } from "@src/module/video/video-partition/entity";
import { VideoPartitionService } from "@src/module/video/video-partition/video-partition.service";
import { VideoTag } from "@src/module/video/video-tag/entity";
import { VideoTagService } from "@src/module/video/video-tag/video-tag.service";
import { getVideoDuration } from "@src/utils/ffmpeg";
import { pageResult } from "@src/utils/tools";
import { In, Repository } from "typeorm";

@Injectable()
export class VideoService {
  /**
   * 视频表
   */
  @InjectRepository(Video)
  private videoRepository: Repository<Video>;
  /**
   * 视频浏览量表
   * @private
   */
  @InjectRepository(VideoView)
  private VVRespository: Repository<VideoView>;
  /**
   * 视频历史记录
   * @private
   */
  @InjectRepository(VideoHistory)
  private VHRepository: Repository<VideoHistory>;
  /**
   * 视频点赞记录
   * @private
   */
  @InjectRepository(VideoLike)
  private VLRepository: Repository<VideoLike>;
  /**
   * 账户服务层
   */
  @Inject(AccountService)
  private accountService: AccountService;
  /**
   * 上传视频服务层
   */
  @Inject(UploadVideoService)
  private uploadVideoService: UploadVideoService;
  /**
   * 用户服务层
   * @private
   */
  @Inject(UserService)
  private userService: UserService;
  /**
   * 文件服务层
   */
  @Inject(FileService)
  private fileService: FileService;
  /**
   * 视频合集服务层
   * @private
   */
  @Inject(forwardRef(() => VideoCollectionService))
  private VCService: VideoCollectionService;
  /**
   * 目录API：自动生成视频封面
   * @private
   */
  @Inject("AUTO_VIDEO_COVER")
  private VCFolder: FfmpegFolder;
  /**
   * 目录API：视频
   * @private
   */
  @Inject("UPLOAD_VIDEO")
  private videoFolder: Folder;
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
   * redis服务层
   */
  @Inject(RedisService)
  private redisService: RedisService;
  /**
   * 视频收藏服务层
   * @private
   */
  @Inject(forwardRef(() => VideoFavoriteService))
  private VFService: VideoFavoriteService;

  /**
   * 发布视频
   * @param account_id 发布者
   * @param createVideoDto 表单
   */
  async publishVideo(
    account_id: number,
    {
      file_id,
      description,
      video_name,
      collection_id_list,
      video_cover,
      partition_id,
      tag_id_list,
    }: PublishVideoDto,
  ) {
    const account = await this.accountService.findById(account_id, true);
    const file = await this.fileService.findById(file_id, true, true);
    if (file.m3u8 === null || file.m3u8.length === 0) {
      // 视频未处理完成，禁止发布视频!
      throw new BadRequestException(VideoMessage.push_video_error);
    }
    // 文件类型是否正确
    if (file.file_type !== FileType.VIDEO) {
      // 选择的文件类型错误
      throw new BadRequestException(VideoMessage.file_type_error);
    }
    // 判断此文件用户是否上传过？
    if ((await this.fileService.fileAccountUploader(file, account)) === false) {
      // 此用户未上传此文件，不允许发布
      throw new BadRequestException(VideoMessage.file_is_not_owner);
    }
    // 视频实例
    let video: Video | null = null;
    // 分区实例
    let partition: VideoPartition | null = null;
    // 合集实例
    let collections: VideoCollection[] = [];
    // 标签实例
    let tags: VideoTag[] = [];
    // 发布时选择将视频发布在某个分区下？
    if (partition_id) {
      partition = await this.VPService.findByIdOrFail(partition_id); // 查询此分区是否存在
    }
    // 发布时选择将视频添加到某些合集中?(对合集非法检查)
    if (collection_id_list && collection_id_list.length) {
      // 若需要将视频添加到视频合集中，进行非法检查
      collections = await Promise.all(
        collection_id_list.map((id) => this.VCService.findById(id, true)),
      );
      // 这些视频合集是否为当前用户创建的？
      if (
        (await this.VCService.isCollectionsOwner(account, collections)) ===
        false
      )
        // 视频合集中存在非当前用户创建的
        throw new BadRequestException(VideoMessage.collection_is_not_owner);
    }
    // 发布时选择给视频添加了标签?(对标签非法检查)
    if (tag_id_list && tag_id_list.length) {
      tags = await this.videoTagService.findTagsById(tag_id_list);
    }
    // 发布视频
    video = await this.create(
      account,
      file,
      video_name,
      description,
      video_cover,
      partition,
    );
    // 发布时选择将视频发布在某个分区下?(添加合集与视频的关系)
    if (collection_id_list && collection_id_list.length) {
      await Promise.all(
        collections.map((c) => this.VCService.addVideosRelation(c, [video])),
      );
    }
    // 发布时选择给视频添加了标签?(添加视频和标签的关系)
    if (tag_id_list && tag_id_list.length) {
      await this.videoTagService.addVideoTags(video, tags);
    }
    // 上传视频封面
    if (video_cover === undefined) {
      // 未上传视频封面，则后台静默生成视频封面
      this.generateVideoCover(file).then(
        (file_path) => {
          this.videoRepository.update(video.video_id, {
            video_cover: file_path,
          });
        },
        (e) => {
          // 出错了，则不设置视频封面
          Logger.error(e);
        },
      );
    }
    return null;
  }

  /**
   * 更新视频信息
   * @param account_id 账户id
   * @param video_id 视频id
   * @param video_name 视频名称
   * @param description 视频描述
   * @param video_cover 视频封面
   */
  async updateInfo(
    account_id: number,
    video_id: number,
    video_name?: string,
    description?: string,
    video_cover?: string,
  ): Promise<null> {
    const video = await this.findById(video_id, true);
    const account = await this.accountService.findById(account_id, true);
    // 校验视频是否为当前用户发布？
    if ((await this.isVideoOwner(account, video)) === false) {
      throw new BadRequestException(VideoMessage.video_is_not_owner);
    }
    const updateInfo: Record<string, unknown> = {};
    if (video_name) updateInfo.video_name = video_name;
    if (description) updateInfo.description = description;
    if (video_cover) updateInfo.video_cover = video_cover;
    await this.videoRepository.update(video.video_id, updateInfo);
    return null;
  }

  /**
   * 查询视频详情信息
   * @param video_id 视频id
   */
  async info(video_id: number) {
    const video = await this.findById(video_id, true);
    if (video === null) {
      throw new NotFoundException(VideoMessage.video_not_exist);
    }
    const info = await this.videoRepository
      .createQueryBuilder("video")
      .where("video.video_id = :video_id", { video_id: video.video_id })
      .leftJoinAndSelect("video.publisher", "user") // 发布人信息
      .leftJoinAndSelect("video.file", "file") // 文件信息
      .leftJoinAndSelect("file.m3u8", "m3u8") // 视频源信息
      .leftJoinAndSelect("video.partition", "partition") // 视频分区
      .leftJoinAndSelect("video.tagRelation", "tagRelation") // 视频与标签关系
      .leftJoinAndSelect("tagRelation.tag", "tag") // 标签信息
      .leftJoinAndSelect("video.comments", "comment") // 评论信息
      .getOne();
    const source = info.file.m3u8; // 播放源信息
    const tags = info.tagRelation.map((item) => item.tag); // 视频标签
    // 观看数量
    const views = await this.VVRespository.createQueryBuilder("views")
      .where("views.video_id = :video_id", { video_id })
      .getCount();
    // 点赞数量
    const likes = await this.VLRepository.createQueryBuilder("like")
      .where("like.video_id = :video_id", { video_id })
      .getCount();
    // 收藏数量
    const stars = await this.VFService.videoStarCount(video_id);
    // 评论数量
    const comments = info.comments.length;

    Reflect.deleteProperty(info, "file");
    Reflect.deleteProperty(info, "tagRelation");
    Reflect.deleteProperty(info, "comments");

    return {
      ...info,
      source,
      tags,
      count: {
        views,
        likes,
        stars,
        comments,
      },
    };
  }

  /**
   * 获取视频列表
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否按照时间降序
   */
  async list(offset: number, limit: number, desc: boolean) {
    const [list, total] = await this.videoRepository.findAndCount({
      relations: ["publisher", "views", "comments"],
      skip: offset,
      take: limit,
      order: {
        created_time: desc ? "desc" : "asc",
      },
    });
    return {
      list: this.videoListFormat(list),
      total,
      has_more: total > offset + limit,
    };
  }

  /**
   * 更新视频分区
   * @param account_id 账户id
   * @param video_id 视频id
   * @param partition_id 合集id
   */
  async updateVideoPartition(
    account_id: number,
    video_id: number,
    partition_id: number,
  ): Promise<null> {
    const account = await this.accountService.findById(account_id, true);
    const video = await this.videoRepository.findOne({
      relations: { partition: true, publisher: true },
      where: { video_id },
    });
    if (video === null) {
      // 视频不存在
      throw new NotFoundException(VideoMessage.video_not_exist);
    }
    if (video.publisher.account_id !== account.account_id) {
      // 视频非本人上传
      throw new BadRequestException(VideoMessage.video_is_not_owner);
    }
    const partition = await this.VPService.findByIdOrFail(partition_id);
    if (
      video.partition !== null &&
      partition.partition_id === video.partition.partition_id
    ) {
      // 要修改的目标分区不能和当前视频分区相同
      throw new BadRequestException(VideoMessage.update_video_partition_error);
    }
    // 更新视频的分区
    await this.videoRepository.update(video.video_id, {
      partition,
    });
    return null;
  }

  /**
   * 获取此分区下的视频
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
    const [list, total] = await this.videoRepository
      .createQueryBuilder("video")
      .leftJoinAndSelect("video.publisher", "publisher")
      .leftJoinAndSelect("video.views", "view")
      .leftJoinAndSelect("video.comments", "comment")
      .where("video.partition_id = :partition_id", {
        partition_id: partition.partition_id,
      })
      .orderBy("video.created_time", desc ? "DESC" : "ASC")
      .skip(offset)
      .take(limit)
      .getManyAndCount();
    return {
      list: this.videoListFormat(list),
      total,
      has_more: total > limit + offset,
    };
  }

  /**
   * 给视频添加标签
   * @param account_id 账户id
   * @param video_id 视频id
   * @param tag_id_list 标签id列表
   */
  async addVideoTags(
    account_id: number,
    video_id: number,
    tag_id_list: number[],
  ): Promise<null> {
    const account = await this.accountService.findById(account_id, true);
    const video = await this.findById(video_id, true);
    if ((await this.isVideoOwner(account, video)) === false)
      throw new BadRequestException(VideoMessage.video_is_not_owner); // 非视频上传者，不能添加视频标签
    // 查询标签
    const tags = await this.videoTagService.findTagsById(tag_id_list);
    // 查询视频是否已经拥有其中某个标签了
    if (
      await this.videoTagService.checkVideoTags(
        video.video_id,
        tag_id_list,
        false,
      )
    )
      throw new BadRequestException(VideoMessage.add_video_tags_error); // 其中有个标签已经存在了
    await this.videoTagService.addVideoTags(video, tags);
    return null;
  }

  /**
   * 移除视频的标签
   * @param account_id 账户id
   * @param video_id 视频id
   * @param tag_id_list id列表
   */
  async removeVideoTags(
    account_id: number,
    video_id: number,
    tag_id_list: number[],
  ): Promise<null> {
    const account = await this.accountService.findById(account_id, true);
    const video = await this.videoRepository
      .createQueryBuilder("video")
      .where("video.video_id = :video_id", { video_id })
      .leftJoinAndSelect("video.tagRelation", "relation")
      .leftJoinAndSelect("relation.tag", "tag")
      .getOne();
    if (video === null) {
      // 视频不存在
      throw new NotFoundException(VideoMessage.video_not_exist);
    }
    // 查询当前用户是否为视频创建者
    if ((await this.isVideoOwner(account, video)) === false) {
      // 非视频上传者，不能移除视频标签
      throw new BadRequestException(VideoMessage.video_is_not_owner);
    }
    // 查询标签是否存在
    await this.videoTagService.findTagsById(tag_id_list);
    // 查询视频是否拥有这些标签
    if (
      (await this.videoTagService.checkVideoTags(
        video.video_id,
        tag_id_list,
        true,
      )) === false
    ) {
      // 视频不包含这些标签
      throw new BadRequestException(VideoMessage.remove_video_tags_error);
    }
    // 过滤出需要被删除的关系
    const tagRelation = video.tagRelation.filter((relation) => {
      return tag_id_list.includes(relation.tag.tag_id);
    });
    await this.videoTagService.removeVideoTags(tagRelation);
    return null;
  }

  /**
   * 增加视频的实时观看人数
   * @param video_id 视频id
   * @param user_id 用户id
   */
  async incWatchVideo(video_id: number, user_id: number): Promise<null> {
    const user = await this.userService.findByUID(user_id, true);
    const video = await this.findById(video_id, true);
    const key = `video-watching:${video.video_id}`;
    const value = String(user.user_id);
    // 此键是否存在
    if (await this.redisService.exists(key)) {
      // 存在
      // 当前用户是否已经在观看视频了？
      if ((await this.redisService.sIsMember(key, value)) === false) {
        // 当前用户未在观看视频集合中，则增加元素
        await this.redisService.sAdd(key, value);
      }
    } else {
      // 不存在，创建一个集合，并以当前用户id添加一个元素
      await this.redisService.sAdd(key, value);
    }
    return null;
  }

  /**
   * 减少视频的实时观看人数
   * @param video_id 视频id
   * @param user_id 用户id
   */
  async decWatchVideo(video_id: number, user_id: number): Promise<null> {
    const user = await this.userService.findByUID(user_id, true);
    const video = await this.findById(video_id, true);
    const key = `video-watching:${video.video_id}`;
    const value = String(user.user_id);
    if ((await this.redisService.exists(key)) === 0) {
      // 键不存在(无人观看此视频)，不能减少视频观看人数
      throw new BadRequestException(VideoMessage.dec_watch_video_error);
    }
    if ((await this.redisService.sIsMember(key, value)) === false) {
      // 当前用户未观看此视频
      throw new BadRequestException(VideoMessage.dec_watch_video_user_error);
    }
    // 从集合中删除一个成员
    await this.redisService.sRem(key, value);
    // 查询集合的数量
    const count = await this.redisService.sCard(key);
    if (count === 0) {
      // 若当前无人观看此视频了，移除集合
      await this.redisService.del(key);
    }
    return null;
  }

  /**
   * 获取视频实时观看数量
   * @param video_id 视频id
   */
  async videoWatchCount(video_id: number) {
    const video = await this.findById(video_id, true);
    const key = `video-watching:${video.video_id}`;
    let count = 0;
    if (await this.redisService.exists(key)) {
      // 集合存在，查询集合中元素数量
      count = await this.redisService.sCard(key);
    }
    return {
      count,
    };
  }

  /**
   * 验证这些视频是否位此人上传的
   * @param account 验证目标
   * @param videos 视频列表
   */
  async isVideosOwner(account: Account, videos: Video[]) {
    const rawVideos = await this.videoRepository.find({
      where: {
        video_id: In(videos.map((item) => item.video_id)),
      },
      relations: ["publisher"],
    });
    return rawVideos.every(
      (video) => video.publisher.account_id === account.account_id,
    );
  }

  /**
   * 查询此视频是否存在
   * @param video_id 视频id
   * @param needFind 是否必须找到
   */
  async findById(video_id: number, needFind = false) {
    const video = await this.videoRepository.findOneBy({ video_id });
    if (needFind && video === null) {
      throw new NotFoundException(VideoMessage.video_not_exist);
    }
    return video;
  }

  /**
   * 通过id列表查询 视频列表
   * @param video_id_list 视频列表
   * @param needFind 未全部找到就报错
   */
  async findByIds(video_id_list: number[], needFind = false) {
    const videos = await this.videoRepository.findBy({
      video_id: In(video_id_list),
    });
    if (needFind && videos.length === 0) {
      throw new NotFoundException(VideoMessage.video_not_exist);
    }
    return videos;
  }

  /**
   * 增加视频浏览量
   * @param video_id 视频号
   * @param user_id 用户id
   */
  async addViews(video_id: number, user_id: number | undefined): Promise<null> {
    let user: User | null = null;
    const video = await this.findById(video_id, true);
    if (user_id !== undefined)
      user = await this.userService.findByUID(user_id, true);
    await this.createViews(video, user);
    return null;
  }

  /**
   * 获取视频浏览量
   * @param video_id 视频id
   */
  async viewsCount(video_id: number) {
    const video = await this.findById(video_id, true);
    const count = await this.VVRespository.createQueryBuilder("views")
      .where("views.video_id = :video_id", { video_id: video.video_id })
      .getCount();
    return {
      count,
    };
  }

  /**
   * 创建用户浏览视频历史记录
   * @param video_id 视频id
   * @param user_id 用户id
   * @param viewing_time 浏览时长
   */
  async addHistory(
    video_id: number,
    user_id: number,
    viewing_time: number,
  ): Promise<null> {
    const video = await this.findById(video_id, true);
    const user = await this.userService.findByUID(user_id, true);
    if (video.duration < viewing_time) {
      // 视频时长小于观看时长
      throw new BadRequestException(VideoMessage.video_history_time_error);
    }
    // 查询是否浏览过此视频
    const flag = await this.findHistory(video_id, user_id);
    if (flag) {
      // 浏览过，需要先删除记录
      await this.deleteHistory(flag.history_id);
    }
    // 创建新的历史记录
    await this.createHistory(video, user, viewing_time);
    return null;
  }

  /**
   * 点赞视频
   * @param video_id 视频id
   * @param user_id 用户id
   */
  async addLike(video_id: number, user_id: number): Promise<null> {
    const user = await this.userService.findByUID(user_id, true);
    const video = await this.findById(video_id, true);
    // 查询是否已经点赞过了
    const flag = await this.findLike(video_id, user_id);
    if (flag) throw new BadRequestException(VideoMessage.like_video_error); // 已经点赞过了!
    // 增加点赞记录
    await this.createLike(video, user);
    return null;
  }

  /**
   * 删除视频浏览的历史记录
   * @param video_id 视频id
   * @param user_id 用户id
   */
  async removeHistory(video_id: number, user_id: number): Promise<null> {
    await this.userService.findByUID(user_id, true);
    await this.findById(video_id, true);
    const history = await this.findHistory(video_id, user_id);
    if (history === null)
      throw new BadRequestException(VideoMessage.remove_video_history_error); // 用户从未浏览过此视频
    await this.deleteHistory(history.history_id);
    return null;
  }

  /**
   * 取消点赞视频
   * @param video_id 视频id
   * @param user_id
   */
  async removeLike(video_id: number, user_id: number): Promise<null> {
    await this.userService.findByUID(user_id, true);
    await this.findById(video_id, true);
    // 查询是否点赞过了
    const like = await this.findLike(video_id, user_id);
    if (like === null)
      throw new BadRequestException(VideoMessage.cancel_like_video_error); // 未点赞过
    // 删除点赞记录
    await this.deleteLike(like.like_id);
    return null;
  }

  /**
   * 增加视频浏览量
   * @param video 视频实例
   * @param user 用户实例
   */
  createViews(video: Video, user: User | null) {
    const views = this.VVRespository.create();
    if (user) views.user = user;
    views.video = video;
    return this.VVRespository.save(views);
  }

  /**
   * 增加视频历史记录
   * @param video 视频实例
   * @param user 用户实例
   * @param viewing_time 观看时长
   */
  createHistory(video: Video, user: User, viewing_time: number) {
    const history = this.VHRepository.create({ viewing_time });
    history.video = video;
    history.user = user;
    return this.VHRepository.save(history);
  }

  /**
   * 增加点赞记录
   * @param video 视频实例
   * @param user 用户实例
   */
  createLike(video: Video, user: User) {
    const like = this.VLRepository.create();
    like.video = video;
    like.user = user;
    return this.VLRepository.save(like);
  }

  /**
   * 查询历史记录
   * @param video_id 视频id
   * @param user_id 用户id
   */
  findHistory(video_id: number, user_id: number) {
    return this.VHRepository.createQueryBuilder("history")
      .where("history.video_id = :video_id", { video_id })
      .andWhere("history.user_id = :user_id", {
        user_id,
      })
      .getOne();
  }

  /**
   * 查询点赞记录
   * @param video_id 视频id
   * @param user_id 用户id
   */
  findLike(video_id: number, user_id: number) {
    return this.VLRepository.createQueryBuilder("like")
      .where("like.user_id = :user_id", { user_id })
      .andWhere("like.video_id = :video_id", { video_id })
      .getOne();
  }

  /**
   * 删除浏览历史记录
   * @param history_id 历史记录
   */
  deleteHistory(history_id: number) {
    return this.VHRepository.softDelete(history_id);
  }

  /**
   * 删除点赞记录
   * @param like_id 点赞记录
   */
  deleteLike(like_id: number) {
    return this.VLRepository.softDelete(like_id);
  }

  /**
   * 创建视频
   * @param account 发布人
   * @param file 文件
   * @param video_name 视频名称
   * @param description 视频描述
   * @param video_cover 视频封面
   * @param partition 视频所属分区
   */
  async create(
    account: Account,
    file: File,
    video_name: string,
    description?: string,
    video_cover?: string,
    partition?: VideoPartition,
  ) {
    const duration = await getVideoDuration(
      this.videoFolder.getAbsolutePath(basename(file.file_path)),
    );
    const video = this.videoRepository.create({ video_name, duration });
    video.publisher = account;
    video.file = file;
    if (description) video.description = description;
    if (video_cover) video.video_cover = video_cover;
    if (partition) video.partition = partition;
    return this.videoRepository.save(video);
  }

  /**
   * 校验此视频的发布者
   * @param account 校验人
   * @param video 目标视频
   */
  async isVideoOwner(account: Account, video: Video) {
    const flag = await this.videoRepository
      .createQueryBuilder("video")
      .where("video.account_id = :account_id", {
        account_id: account.account_id,
      })
      .andWhere("video.video_id = :video_id", { video_id: video.video_id })
      .getOne();
    return flag !== null;
  }

  /**
   * 生成视频封面
   * @param file 文件实例
   */
  generateVideoCover(file: File) {
    // 生成文件的绝对路径
    const filepath = this.videoFolder.getAbsolutePath(basename(file.file_path));
    // 截取并生成视频封面
    return this.VCFolder.setVideoFirstFrame(filepath);
  }

  /**
   * 查询当前用户对视频的态度
   * @param video_id 视频id
   * @param user_id 用户id
   */
  async getVideoStatus(video_id: number, user_id: number) {
    await this.findById(video_id, true);
    await this.userService.findByUID(user_id, true);
    const isStar = await this.VFService.isStarVideo(user_id, video_id);
    const isLike = Boolean(
      await this.VLRepository.createQueryBuilder("like")
        .where("like.video_id = :video_id", { video_id })
        .andWhere("like.user_id = :user_id", { user_id })
        .getOne(),
    );
    return {
      is_star: isStar,
      is_like: isLike,
    };
  }

  /**
   * 获取某合集下的视频列表
   * @param collection_id 合集id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 根据创建时间降序
   */
  async videoListInCollection(
    collection_id: number,
    offset: number,
    limit: number,
    desc: boolean,
  ) {
    const [list, total] = await this.videoRepository
      .createQueryBuilder("video")
      .leftJoinAndSelect("video.collections", "collection")
      .leftJoinAndSelect("video.views", "view")
      .leftJoinAndSelect("video.comments", "comment")
      .where("collection.collection_id = :collection_id", { collection_id }) // 非常奇怪，这样查询就是对的
      .leftJoinAndSelect("video.publisher", "publisher")
      .skip(offset)
      .take(limit)
      .orderBy("video.created_time", desc ? "DESC" : "ASC")
      .getManyAndCount();
    list.forEach((item) => Reflect.deleteProperty(item, "collections"));

    return [this.videoListFormat(list), total] as [Video[], number];
  }

  /**
   * 获取某个老师的视频
   * @param account_id
   * @param offset
   * @param limit
   * @param desc
   */
  async getTeacherVideoList(
    account_id: number,
    offset: number,
    limit: number,
    desc: boolean,
  ) {
    const account = await this.accountService.findById(account_id, true);
    const role = await account.role;
    if (role.role_name === Roles.TEACHER) {
      const [list, total] = await this.videoRepository
        .createQueryBuilder("video")
        .leftJoinAndSelect(
          "video.publisher",
          "account",
          "account.account_id = video.account_id",
        )
        .where("account.account_id = :account_id", { account_id })
        .skip(offset)
        .take(limit)
        .orderBy("video.created_time", desc ? "DESC" : "ASC")
        .getManyAndCount();
      return pageResult(list, total, offset, limit);
    } else {
      // 角色非老师
      throw new BadRequestException();
    }
  }

  /**
   * 格式化视频列表
   * @param list
   */
  videoListFormat(list: Video[]) {
    return list.map((item) => {
      const newItem = {
        ...item,
        view_count: item.views.length,
        comment_count: item.comments.length,
      };
      Reflect.deleteProperty(newItem, "views");
      Reflect.deleteProperty(newItem, "comments");
      return newItem;
    });
  }

  /**
   * 当前用户是否有权限操作视频
   * @param accountId 后台账户id
   * @param videoId 视频id
   * @param toAdmin 是否给管理员开放
   */
  async hasPermission(accountId: number, videoId: number, toAdmin = false) {
    const video = await this.videoRepository.findOne({
      where: { video_id: videoId },
      relations: { publisher: true },
    });
    if (!video) throw new NotFoundException(VideoMessage.video_not_exist);
    const { account_id, role: { role_name } = { role_name: "" } } =
      await this.accountService.getAccountInfo(accountId);
    if (
      account_id === video.publisher.account_id || // 是视频发布者
      (toAdmin &&
        (role_name === Roles.SUPER_ADMIN || role_name === Roles.ADMIN)) // 是管理人员
    ) {
      return video;
    }
    throw new ForbiddenException("无权限");
  }

  /**
   * 软删除视频
   * @param video_id 视频id
   * @param account_id 账户id
   */
  async deleteVideo(video_id: number, account_id: number) {
    const video = await this.hasPermission(account_id, video_id, true);
    await this.videoRepository.softRemove(video);
    return null;
  }
}
