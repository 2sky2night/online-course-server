import { User } from "@src/module/user/entity";
import { Video } from "@src/module/video/video/entity";
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
 * 视频弹幕模型
 */
@Entity({
  comment: "视频弹幕表",
})
export class VideoDanmu {
  /**
   * 弹幕id
   */
  @PrimaryGeneratedColumn({ comment: "弹幕id" })
  danmu_id: number;
  /**
   * 弹幕的内容
   */
  @Column({ type: "text", comment: "弹幕的内容" })
  content: string;
  /**
   * 弹幕发布时间(单位：秒)
   */
  @Column({ type: "float", comment: "在视频中的某个时间点发布的(单位：秒)" })
  time: number;
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
   * 用户（一个用户可以发布多个视频弹幕）
   */
  @ManyToOne(() => User, (user) => user.videoDanmus)
  @JoinColumn({ name: "user_id" })
  user: User;
  /**
   * 视频(一个视频中可以包含多个视频弹幕)
   */
  @ManyToOne(() => Video, (video) => video.danmus)
  @JoinColumn({ name: "video_id" })
  video: Video;
}
