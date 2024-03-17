import { User } from "@src/module/user/entity";
import { Video } from "@src/module/video/video/entity/video.entity";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * 用户浏览历史记录
 */
@Entity({
  comment: "视频浏览历史记录表",
})
export class VideoHistory {
  /**
   * 历史记录id
   */
  @PrimaryGeneratedColumn({ comment: "历史记录id" })
  history_id: number;
  /**
   * 观看时间
   */
  @Column({ type: "float", comment: "浏览时长,秒为单位" })
  viewing_time: number;
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
   * 一个用户有多个视频浏览记录
   */
  @ManyToOne(() => User, (user) => user.videoHistories)
  @JoinColumn({ name: "user_id" })
  user: User;
  /**
   * 一个视频有多个用户的历史记录
   */
  @ManyToOne(() => Video, (video) => video.histories)
  @JoinColumn({ name: "video_id" })
  video: Video;
}
