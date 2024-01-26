import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { AccountService } from "@src/module/account/service";
import { UploadVideoService } from "@src/module/upload/module/video/upload-video.service";
import { Video } from "@src/module/video/entity";
import { CreateVideoDto } from "@src/module/video/dto";
import { FileType } from "@src/module/upload/enum";
import { VideoMessage } from "@src/config/message";

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
   * 发布视频
   * @param accountId 发布者
   * @param createVideoDto 表单
   */
  async createVideo(
    accountId: number,
    { file_trace_id, description, video_name }: CreateVideoDto,
  ) {
    const account = await this.accountService.findById(accountId, true);
    const trace = await this.uploadVideoService.findById(file_trace_id, true);
    if (trace.file_type !== FileType.VIDEO) {
      // 选择的文件类型错误
      throw new BadRequestException(VideoMessage.file_type_error);
    }
    if (accountId !== (await trace.uploader).account_id) {
      // 指定的文件非本人上传
      throw new BadRequestException(VideoMessage.file_is_not_owner);
    }
    if ((await trace.video) !== null) {
      // 查询此上传记录是否已经被绑定过了(由于上传记录和视频是一对一关系，所以上传记录只能有一个视频id对应)
      throw new BadRequestException(VideoMessage.file_is_already_publish);
    }
    const video = this.videoRepository.create({
      video_name,
      description,
    });
    video.uploader = Promise.resolve(account);
    video.file = Promise.resolve(trace);
    const raw_video = await this.videoRepository.save(video);
    return {
      video_id: raw_video.video_id,
      video_name: raw_video.video_name,
      description: raw_video.description,
    };
  }
}
