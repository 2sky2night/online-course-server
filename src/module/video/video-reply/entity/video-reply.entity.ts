import { User } from "@src/module/user/entity";
import { VideoComment } from "@src/module/video/video-comment/entity/video-comment.entity";
import { VideoReplyLike } from "@src/module/video/video-reply/entity/video-reply-like.entity";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * 视频回复表
 */
@Entity({
  comment: "视频评论回复表",
})
export class VideoReply {
  /**
   * 回复的id
   */
  @PrimaryGeneratedColumn({ comment: "回复的id" })
  reply_id: number;
  /**
   * 回复的内容
   */
  @Column({ comment: "回复的内容" })
  content: string;
  /**
   * 回复的配图
   */
  @Column({ nullable: true, type: "json", comment: "回复的配图" })
  images: string | null;
  /**
   * 回复的目标
   */
  @Column({ comment: "回复的目标", nullable: true })
  ref_id: number | null;
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
   * 回复的用户（多个回复可以来自同一个用户）
   */
  @ManyToOne(() => User, (user) => user.videoReplies)
  @JoinColumn({ name: "user_id" })
  user: User;
  /**
   * 回复的目标评论（多个回复可以来自同一个评论）
   */
  @ManyToOne(() => VideoComment, (vc) => vc.replies)
  @JoinColumn({ name: "comment_id" })
  comment: VideoComment;
  /**
   * 一个回复可以被点赞多次
   */
  @OneToMany(() => VideoReplyLike, (vrl) => vrl.reply)
  likes: VideoReplyLike[];
}
