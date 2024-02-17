import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { VideoDanmu } from "@src/module/video/video-danmu/entity";
import { Repository } from "typeorm";
import { UserService } from "@src/module/user/service";
import { VideoService } from "@src/module/video/video/video.service";
import { VideoMessage } from "@src/config/message";

/**
 * 弹幕服务层
 */
@Injectable()
export class VideoDanmuService {
  /**
   * 视频弹幕模型
   * @private
   */
  @InjectRepository(VideoDanmu)
  private danmuRepository: Repository<VideoDanmu>;
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
  @Inject(VideoService)
  private videoService: VideoService;

  /**
   * 创建弹幕
   * @param video_id 视频id
   * @param user_id 用户id
   * @param content 弹幕内容
   * @param time 发布时间
   */
  async createDanmu(
    video_id: number,
    user_id: number,
    content: string,
    time: number,
  ): Promise<null> {
    const video = await this.videoService.findById(video_id, true);
    const user = await this.userService.findByUID(user_id, true);
    if (time > video.duration) {
      // 发布时间超过视频时长
      throw new BadRequestException(VideoMessage.create_danmu_error);
    }
    // 创建弹幕
    const danmu = this.danmuRepository.create({ time, content, video, user });
    await this.danmuRepository.save(danmu);
    return null;
  }

  /**
   * 获取某个时间段的弹幕
   * @param video_id 视频id
   * @param start 开始时间
   * @param end 结束时间
   */
  async list(video_id: number, start: number, end: number) {
    const video = await this.videoService.findById(video_id, true);
    const list = await this.danmuRepository
      .createQueryBuilder("danmu")
      .where("danmu.video_id = :video_id", { video_id: video.video_id })
      .andWhere("danmu.time between :start and :end", { start, end })
      .getMany();
    return {
      list,
    };
  }
}
