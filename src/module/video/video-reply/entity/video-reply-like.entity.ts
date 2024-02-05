import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { VideoReply } from "@src/module/video/video-reply/entity/video-reply.entity";
import { User } from "@src/module/user/entity";

/**
 * 点赞视频回复表
 */
@Entity()
export class VideoReplyLike {
  /**
   * 点赞的id
   */
  @PrimaryGeneratedColumn({ comment: "点赞的id" })
  like_id: number;
  /**
   * 创建时间
   */
  @CreateDateColumn({ type: "datetime", comment: "创建时间" })
  created_time: Date;
  /**
   * 修改时间
   */
  @UpdateDateColumn({ type: "datetime", comment: "修改时间" })
  updated_time: Date;
  /**
   * 删除时间
   */
  @DeleteDateColumn({ type: "datetime", comment: "删除时间" })
  deleted_time: Date | null;
  /**
   * 多个点赞记录可以对应同一个回复
   */
  @ManyToOne(() => VideoReply, (vr) => vr.likes)
  @JoinColumn({ name: "reply_id" })
  reply: VideoReply;
  /**
   * 多个点赞记录可以来自同一个用户
   */
  @ManyToOne(() => User, (user) => user.likeVideoReplies)
  @JoinColumn({ name: "user_id" })
  user: User;
}
