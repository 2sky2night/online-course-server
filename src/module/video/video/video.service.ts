import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Video } from "@src/module/video/video/entity";
import { AccountService } from "@src/module/account/service";
import { UploadVideoService } from "@src/module/upload/module/video/upload-video.service";
import { FileService } from "@src/module/file/service";
import { PublishVideoDto } from "@src/module/video/video/dto";
import { VideoMessage } from "@src/config/message";
import { FileType } from "@src/module/file/enum";
import { Account } from "@src/module/account/entity";
import { File } from "@src/module/file/entity";
import { VideoCollectionService } from "@src/module/video/video-collection/video-collection.service";

@Injectable()
export class VideoService {
  /**
   * 视频表
   */
  @InjectRepository(Video)
  private videoRepository: Repository<Video>;
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
   * 发布视频
   * @param account_id 发布者
   * @param createVideoDto 表单
   */
  async publishVideo(
    account_id: number,
    { file_id, description, video_name, collection_id_list }: PublishVideoDto,
  ) {
    const account = await this.accountService.findById(account_id, true);
    const file = await this.fileService.findById(file_id, true);
    if (file.file_type !== FileType.VIDEO) {
      // 选择的文件类型错误
      throw new BadRequestException(VideoMessage.file_type_error);
    }
    // 判断此文件用户是否上传过？
    const flag = await this.fileService.fileUploader(file, account);
    if (flag === false) {
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
      const video = await this.create(account, file, video_name, description);
      // 添加视频和视频合集的关系
      await Promise.all(
        collections.map((c) => this.VCService.addVideosRelation(c, [video])),
      );
    } else {
      // 直接发布视频
      await this.create(account, file, video_name, description);
    }

    return null;
  }

  /**
   * 更新视频信息
   * @param account_id 账户id
   * @param video_id 视频id
   * @param video_name 视频名称
   * @param description 视频描述
   */
  async updateInfo(
    account_id: number,
    video_id: number,
    video_name?: string,
    description?: string,
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
    await this.videoRepository.update(video.video_id, updateInfo);
    return null;
  }

  /**
   * 查询视频详情信息
   * @param video_id 视频id
   */
  async info(video_id: number) {
    const video = await this.findById(video_id, true);
    return {
      ...video,
      publisher: await video.publisher,
      file: await video.file,
    };
  }

  /**
   * 获取视频列表
   * @param offset 偏移量
   * @param limit 长度
   */
  async list(offset: number, limit: number) {
    const [list, total] = await this.videoRepository.findAndCount({
      skip: offset,
      take: limit,
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
    for (let i = 0; i < videos.length; i++) {
      const flag = await this.isVideoOwner(account, videos[i]);
      if (flag === false) {
        return false;
      }
    }
    return true;
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
   * 创建视频
   * @param account 发布人
   * @param file 文件
   * @param video_name 视频名称
   * @param description 视频描述
   */
  create(
    account: Account,
    file: File,
    video_name: string,
    description: string | undefined,
  ) {
    const video = this.videoRepository.create(
      description ? { video_name, description } : { video_name },
    );
    video.publisher = Promise.resolve(account);
    video.file = Promise.resolve(file);
    return this.videoRepository.save(video);
  }

  /**
   * 校验此视频的发布者
   * @param account 校验人
   * @param video 目标视频
   */
  async isVideoOwner(account: Account, video: Video) {
    const publisher = await video.publisher;
    return publisher.account_id === account.account_id;
  }
}
