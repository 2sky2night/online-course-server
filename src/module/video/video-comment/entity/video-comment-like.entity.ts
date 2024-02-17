import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "@src/module/user/entity";
import { VideoComment } from "@src/module/video/video-comment/entity/video-comment.entity";

/**
 * 点赞视频评论表
 */
@Entity({
  comment: "点赞视频评论表",
})
export class VideoCommentLike {
  /**
   * 视频点赞的id
   */
  @PrimaryGeneratedColumn({ comment: "视频点赞的id" })
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
   * 一个用户可以产生多个点赞视频评论记录
   */
  @ManyToOne(() => User, (user) => user.likeVideoComments)
  @JoinColumn({ name: "user_id" })
  user: User;
  /**
   * 一个评论可以被点赞多次
   */
  @ManyToOne(() => VideoComment, (vc) => vc.likes)
  @JoinColumn({ name: "comment_id" })
  comment: VideoComment;
}
