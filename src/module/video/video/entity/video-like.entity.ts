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
import { Video } from "@src/module/video/video/entity/video.entity";

/**
 * 视频点赞表
 */
@Entity()
export class VideoLike {
  /**
   * 点赞记录id
   */
  @PrimaryGeneratedColumn({ comment: "点赞记录id" })
  like_id: number;
  /**
   * 一个用户可以产生多个对视频的点赞记录
   */
  @ManyToOne(() => User, (user) => user.videoLikes)
  @JoinColumn({ name: "user_id" })
  user: User;
  /**
   * 一个视频可以有多个点赞记录
   */
  @ManyToOne(() => Video, (video) => video.likes)
  @JoinColumn({ name: "video_id" })
  video: Video;
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
}
