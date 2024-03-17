import { User } from "@src/module/user/entity";
import { Video } from "@src/module/video/video/entity";
import { VideoCommentLike } from "@src/module/video/video-comment/entity/video-comment-like.entity";
import { VideoReply } from "@src/module/video/video-reply/entity";
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
 * 视频评论表
 */
@Entity({
  comment: "视频评论表",
})
export class VideoComment {
  /**
   * 评论id
   */
  @PrimaryGeneratedColumn({ comment: "评论id" })
  comment_id: number;
  /**
   * 评论的内容
   */
  @Column({ comment: "评论的内容", type: "text" })
  content: string;
  /**
   * 评论的配图
   */
  @Column({ nullable: true, type: "json", comment: "评论的配图" })
  images: string | null;
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
   * 多个评论可以来自一个视频
   */
  @ManyToOne(() => Video, (video) => video.comments)
  @JoinColumn({ name: "video_id" })
  video: Video;
  /**
   * 多个评论可以来自一个用户
   */
  @ManyToOne(() => User, (user) => user.videoComments)
  @JoinColumn({ name: "user_id" })
  user: User;
  /**
   * 一个评论可以被多个用户点赞
   */
  @OneToMany(() => VideoCommentLike, (vcl) => vcl.comment)
  likes: VideoCommentLike[];
  /**
   * 一个评论包含多个回复
   */
  @OneToMany(() => VideoReply, (vr) => vr.comment)
  replies: VideoReply[];
}
