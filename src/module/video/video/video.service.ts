import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { basename } from "node:path";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import {
  Video,
  VideoHistory,
  VideoLike,
  VideoView,
} from "@src/module/video/video/entity";
import { AccountService } from "@src/module/account/service";
import { UploadVideoService } from "@src/module/upload/module/video/upload-video.service";
import { FileService } from "@src/module/file/service";
import { PublishVideoDto } from "@src/module/video/video/dto";
import { VideoMessage } from "@src/config/message";
import { FileType } from "@src/module/file/enum";
import { Account } from "@src/module/account/entity";
import { File } from "@src/module/file/entity";
import { VideoCollectionService } from "@src/module/video/video-collection/video-collection.service";
import { FfmpegFolder, Folder } from "@src/lib/folder";
import { getVideoDuration } from "@src/utils/ffmpeg";
import { UserService } from "@src/module/user/service";
import { User } from "@src/module/user/entity";

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
    }: PublishVideoDto,
  ) {
    const account = await this.accountService.findById(account_id, true);
    const file = await this.fileService.findById(file_id, true);
    if (file.file_type !== FileType.VIDEO) {
      // 选择的文件类型错误
      throw new BadRequestException(VideoMessage.file_type_error);
    }
    // 判断此文件用户是否上传过？
    if ((await this.fileService.fileAccountUploader(file, account)) === false) {
      // 此用户未上传此文件，不允许发布
      throw new BadRequestException(VideoMessage.file_is_not_owner);
    }
    if (collection_id_list && collection_id_list.length) {
      // 若需要将视频添加到视频合集中
      const collections = await Promise.all(
        collection_id_list.map((id) => this.VCService.findById(id, true)),
      );
      // 这些视频合集是否为当前用户创建的？
      const flag = await this.VCService.isCollectionsOwner(
        account,
        collections,
      );
      if (flag === false) {
        // 视频合集中存在非当前用户创建的
        throw new BadRequestException(VideoMessage.collection_is_not_owner);
      }
      // 增加视频
      const video = await this.create(
        account,
        file,
        video_name,
        description,
        video_cover,
      );
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
      // 添加视频和视频合集的关系
      await Promise.all(
        collections.map((c) => this.VCService.addVideosRelation(c, [video])),
      );
    } else {
      // 直接发布视频
      const video = await this.create(
        account,
        file,
        video_name,
        description,
        video_cover,
      );
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
  ) {
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
    const video = await this.videoRepository.findOne({
      where: { video_id },
      relations: ["publisher", "file", "collections"],
    });
    if (video === null) {
      throw new NotFoundException(VideoMessage.video_not_exist);
    }
    return video;
  }

  /**
   * 获取视频列表
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否按照时间降序
   */
  async list(offset: number, limit: number, desc: boolean) {
    const [list, total] = await this.videoRepository.findAndCount({
      relations: ["publisher"],
      skip: offset,
      take: limit,
      order: {
        created_time: desc ? "desc" : "asc",
      },
    });
    return {
      list,
      total,
      has_more: total > offset + limit,
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
   * 增加视频浏览量
   * @param video_id 视频号
   * @param user_id 用户id
   */
  async addViews(video_id: number, user_id: number): Promise<null> {
    const user = await this.userService.findByUID(user_id, true);
    const video = await this.findById(video_id, true);
    await this.createViews(video, user);
    return null;
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
  createViews(video: Video, user: User) {
    const views = this.VVRespository.create();
    views.user = user;
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
   */
  async create(
    account: Account,
    file: File,
    video_name: string,
    description?: string,
    video_cover?: string,
  ) {
    const duration = await getVideoDuration(
      this.videoFolder.getAbsolutePath(basename(file.file_path)),
    );
    const video = this.videoRepository.create({ video_name, duration });
    video.publisher = account;
    video.file = file;
    if (description) video.description = description;
    if (video_cover) video.video_cover = video_cover;
    return this.videoRepository.save(video);
  }

  /**
   * 校验此视频的发布者
   * @param account 校验人
   * @param video 目标视频
   */
  async isVideoOwner(account: Account, video: Video) {
    const rawVideo = await this.videoRepository
      .createQueryBuilder("video")
      .leftJoinAndSelect("video.publisher", "publisher")
      .where({ video_id: video.video_id })
      .getOne();
    console.log(rawVideo);
    return rawVideo.publisher.account_id === account.account_id;
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
}
