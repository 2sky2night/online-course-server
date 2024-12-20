import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { VideoMessage } from "@src/config/message";
import { User } from "@src/module/user/entity";
import { UserService } from "@src/module/user/service";
import { VideoService } from "@src/module/video/video/video.service";
import { VideoComment } from "@src/module/video/video-comment/entity";
import { VideoCommentService } from "@src/module/video/video-comment/video-comment.service";
import {
  VideoReply,
  VideoReplyLike,
} from "@src/module/video/video-reply/entity";
import { pageResult } from "@src/utils/tools";
import { Repository } from "typeorm";

/**
 * 视频回复服务层
 */
@Injectable()
export class VideoReplyService {
  /**
   * 视频回复表
   * @private
   */
  @InjectRepository(VideoReply)
  private videoReplyRepository: Repository<VideoReply>;
  /**
   * 点赞视频回复表
   * @private
   */
  @InjectRepository(VideoReplyLike)
  private VRLRepository: Repository<VideoReplyLike>;
  /**
   * 视频评论服务层
   * @private
   */
  @Inject(VideoCommentService)
  private videoCommentService: VideoCommentService;
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
   * 添加回复
   * @param user_id 用户id
   * @param comment_id 评论id
   * @param content 内容
   * @param images 配图
   * @param ref_id 回复的目标
   */
  async addReply(
    user_id: number,
    comment_id: number,
    content: string,
    images: string[] | undefined,
    ref_id: number | undefined,
  ): Promise<null> {
    const user = await this.userService.findByUID(user_id, true);
    const comment = await this.videoCommentService.findCommentById(
      comment_id,
      true,
    );
    if (ref_id) {
      // 引用了回复
      await this.findReplyById(ref_id, true); // 是否存在此回复
      const flag = await this.checkCommentInclude(ref_id, comment_id); // 此回复是否包含在目标评论中
      if (flag === null)
        throw new BadRequestException(VideoMessage.comment_not_include_reply);
    }
    // 发布回复
    await this.createReply(user, comment, content, images, ref_id);
    return null;
  }

  /**
   * 增加点赞回复记录
   * @param user_id 用户id
   * @param reply_id 回复id
   */
  async addReplyLike(user_id: number, reply_id: number): Promise<null> {
    const user = await this.userService.findByUID(user_id, true);
    const reply = await this.findReplyById(reply_id, true);
    // 查询当前用户是否点赞过此回复?
    if (await this.findReplyLike(reply_id, user_id)) {
      // 已经点过赞了
      throw new BadRequestException(VideoMessage.like_reply_error);
    }
    await this.createLike(user, reply);
    return null;
  }

  /**
   * 取消点赞
   * @param user_id 用户id
   * @param reply_id 回复id
   */
  async removeReplyLike(user_id: number, reply_id: number): Promise<null> {
    const user = await this.userService.findByUID(user_id, true);
    const reply = await this.findReplyById(reply_id, true);
    // 查询当前用户是否点赞过此回复?
    const like = await this.findReplyLike(reply.reply_id, user.user_id);
    if (like === null) {
      // 未点过赞，不能取消点赞
      throw new BadRequestException(VideoMessage.cancel_like_reply_error);
    }
    await this.deleteLike(like.like_id);
    return null;
  }

  /**
   * 查询某个评论的回复
   * @param comment_id 评论id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否降序
   */
  async list(comment_id: number, offset: number, limit: number, desc: boolean) {
    await this.videoCommentService.findCommentById(comment_id);
    const [list, total] = await this.videoReplyRepository
      .createQueryBuilder("reply")
      .where("reply.comment_id = :comment_id", { comment_id })
      .orderBy("reply.created_time", desc ? "DESC" : "ASC")
      .skip(offset)
      .take(limit)
      .leftJoinAndSelect("reply.user", "user")
      .getManyAndCount();
    return {
      list,
      total,
      has_more: total > limit + offset,
    };
  }

  /**
   * 查询所有回复
   * @param offset
   * @param limit
   * @param desc
   */
  async commonList(offset: number, limit: number, desc: boolean) {
    const [list, total] = await this.videoReplyRepository.findAndCount({
      take: limit,
      skip: offset,
      order: { created_time: desc ? "DESC" : "ASC" },
      relations: {
        user: true,
      },
    });
    return pageResult(list, total, offset, limit);
  }

  /**
   * 通过id查询回复记录
   * @param reply_id 回复id
   * @param needFind 未找到是否报错？
   */
  async findReplyById(reply_id: number, needFind = false) {
    const reply = await this.videoReplyRepository.findOneBy({ reply_id });
    if (reply === null && needFind) {
      throw new NotFoundException(VideoMessage.reply_not_exist);
    }
    return reply;
  }

  /**
   * 查询用户是否点赞过此回复
   * @param reply_id 回复id
   * @param user_id 用户id
   */
  findReplyLike(reply_id: number, user_id: number) {
    return this.VRLRepository.createQueryBuilder("like")
      .where("like.reply_id = :reply_id", { reply_id })
      .andWhere("like.user_id = :user_id", { user_id })
      .getOne();
  }

  /**
   * 查询此评论中是否包含该回复
   * @param reply_id 回复id
   * @param comment_id 评论id
   */
  checkCommentInclude(reply_id: number, comment_id: number) {
    return this.videoReplyRepository
      .createQueryBuilder("reply")
      .where("reply.reply_id = :reply_id", { reply_id })
      .andWhere("reply.comment_id = :comment_id", { comment_id })
      .getOne();
  }

  /**
   * 创建回复
   * @param user 回复的用户
   * @param comment 回复的评论
   * @param content 回复的内容
   * @param images 回复的配图
   * @param ref_id 回复的目标（评论或回复）
   */
  createReply(
    user: User,
    comment: VideoComment,
    content: string,
    images: string[] | undefined,
    ref_id: number | undefined,
  ) {
    const reply = this.videoReplyRepository.create({ content, user, comment });
    if (images) reply.images = JSON.stringify(images);
    if (ref_id) reply.ref_id = ref_id;
    return this.videoReplyRepository.save(reply);
  }

  /**
   * 创建点赞记录
   * @param user 用户实例
   * @param reply 回复实例
   */
  createLike(user: User, reply: VideoReply) {
    const like = this.VRLRepository.create({ user, reply });
    return this.VRLRepository.save(like);
  }

  /**
   * 软删除点赞记录
   * @param like_id 点赞id
   */
  deleteLike(like_id: number) {
    return this.VRLRepository.softDelete(like_id);
  }

  /**
   * 查询某个视频里的回复
   * @param video_id
   * @param offset
   * @param limit
   * @param desc
   */
  async replyListInVideo(
    video_id: number,
    offset: number,
    limit: number,
    desc: boolean,
  ) {
    await this.videoService.findById(video_id, true);
    const [list, total] = await this.videoReplyRepository
      .createQueryBuilder("reply")
      .leftJoinAndSelect("reply.comment", "comment")
      .leftJoinAndSelect(
        "comment.video",
        "video",
        "comment.video_id = video.video_id",
      )
      .where("video.video_id = :video_id", { video_id })
      .leftJoinAndSelect("reply.user", "user")
      .take(limit)
      .skip(offset)
      .orderBy("reply.created_time", desc ? "DESC" : "ASC")
      .getManyAndCount();
    list.forEach((item) => Reflect.deleteProperty(item, "comment"));
    return pageResult(list, total, offset, limit);
  }
}
