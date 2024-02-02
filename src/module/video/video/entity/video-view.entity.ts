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
 * 视频浏览量
 */
@Entity()
export class VideoView {
  /**
   * 追踪id
   */
  @PrimaryGeneratedColumn({ comment: "浏览量id" })
  trace_id: number;
  /**
   * 多个视频浏览量可以来自一个视频
   */
  @ManyToOne(() => Video, (video) => video.views)
  @JoinColumn({ name: "video_id" })
  video: Video;
  /**
   * 多个视频浏览可以来自一个用户
   */
  @ManyToOne(() => User, (user) => user.videoViews)
  @JoinColumn({ name: "user_id" })
  user: User;
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
