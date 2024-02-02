import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  VideoComment,
  VideoCommentLike,
} from "@src/module/video/video-comment/entity";
import { Repository } from "typeorm";
import { UserService } from "@src/module/user/service";
import { VideoService } from "@src/module/video/video/video.service";
import { VideoMessage } from "@src/config/message";
import { User } from "@src/module/user/entity";
import { Video } from "@src/module/video/video/entity";

/**
 * 视频评论服务层
 */
@Injectable()
export class VideoCommentService {
  /**
   * 视频评论表
   * @private
   */
  @InjectRepository(VideoComment)
  private VCRepository: Repository<VideoComment>;
  /**
   * 点赞评论表
   * @private
   */
  @InjectRepository(VideoCommentLike)
  private VCLRepository: Repository<VideoCommentLike>;
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
   * 发布评论
   * @param video_id 视频id
   * @param user_id 用户id
   * @param content 评论内容
   * @param images 配图
   */
  async addComment(
    video_id: number,
    user_id: number,
    content: string,
    images: string[] | undefined,
  ) {
    const user = await this.userService.findByUID(user_id, true);
    const video = await this.videoService.findById(video_id, true);
    // 创建评论
    await this.createComment(video, user, content, images);
    return null;
  }

  /**
   * 查询某个视频下的评论
   * @param video_id 视频id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否按照发布时间降序排序
   */
  async list(video_id: number, offset: number, limit: number, desc: boolean) {
    await this.videoService.findById(video_id, true);
    const [list, total] = await this.VCRepository.createQueryBuilder("comment")
      .leftJoinAndSelect("comment.video", "video")
      .where("video.video_id = :video_id", { video_id })
      .orderBy("comment.created_time", desc ? "DESC" : "ASC")
      .select(["comment"])
      .skip(offset)
      .take(limit)
      .getManyAndCount();
    return {
      list,
      total,
      has_more: total > offset + limit,
    };
  }

  /**
   * 点赞评论
   * @param comment_id 评论id
   * @param user_id 用户id
   */
  async addCommentLike(comment_id: number, user_id: number) {
    const comment = await this.findCommentById(comment_id, true);
    const user = await this.userService.findByUID(user_id, true);
    // 查询是否点过赞了
    const flag = await this.findCommentLike(comment_id, user_id);
    if (flag) throw new BadRequestException(VideoMessage.like_comment_error); // 已经点赞过了
    // 增加点赞记录
    await this.createCommentLike(comment, user);
    return null;
  }

  /**
   * 取消点赞评论
   * @param comment_id 评论id
   * @param user_id 用户id
   */
  async removeCommentLike(comment_id: number, user_id: number) {
    await this.userService.findByUID(user_id, true);
    await this.findCommentById(comment_id, true);
    // 查询是否点赞过此评论
    const flag = await this.findCommentLike(comment_id, user_id);
    if (flag === null)
      throw new BadRequestException(VideoMessage.cancel_like_comment_error); // 未点赞过此评论
    // 删除点赞记录
    await this.deleteCommentLike(flag.like_id);
    return null;
  }

  /**
   * 创建点赞评论记录
   * @param comment 评论
   * @param user 用户
   */
  createCommentLike(comment: VideoComment, user: User) {
    const like = this.VCLRepository.create();
    like.comment = comment;
    like.user = user;
    return this.VCLRepository.save(like);
  }

  /**
   * 创建评论
   * @param video 视频实例
   * @param user 用户实例
   * @param content 评论内容
   * @param images 配图？
   */
  createComment(
    video: Video,
    user: User,
    content: string,
    images: string[] | undefined,
  ) {
    const comment = this.VCRepository.create({ content });
    if (images) comment.images = JSON.stringify(images);
    comment.video = video;
    comment.user = user;
    return this.VCRepository.save(comment);
  }

  /**
   * 通过id查询某个评论
   * @param comment_id 评论id
   * @param needFind 未找到报错
   */
  async findCommentById(comment_id: number, needFind = false) {
    const comment = await this.VCRepository.findOneBy({ comment_id });
    if (comment === null && needFind) {
      throw new NotFoundException(VideoMessage.comment_not_exist);
    }
    return comment;
  }

  /**
   * 查找点赞评论记录
   * @param comment_id 评论id
   * @param user_id 用户id
   * @return {Promise<VideoCommentLike|null>} 若无记录，返回null
   */
  findCommentLike(comment_id: number, user_id: number) {
    return this.VCLRepository.createQueryBuilder("like")
      .where("like.comment_id = :comment_id", { comment_id })
      .andWhere("like.user_id = :user_id", { user_id })
      .getOne();
  }

  /**
   * 软删除点赞评论记录
   * @param like_id 点赞记录
   */
  deleteCommentLike(like_id: number) {
    return this.VCLRepository.softDelete(like_id);
  }
}
