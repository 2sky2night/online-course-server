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
import { Account } from "@src/module/account/entity";
import { Video } from "@src/module/video/video/entity";
import { VideoCollection } from "@src/module/video/video-collection/entity";

/**
 * 视频分区模型
 */
@Entity()
export class VideoPartition {
  /**
   * 视频分区的id
   */
  @PrimaryGeneratedColumn({ comment: "视频分区的id" })
  partition_id: number;
  /**
   * 分区的名称
   */
  @Column({ comment: "分区的名称" })
  partition_name: string;
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
   * 一个管理员可以创建多个分区
   */
  @ManyToOne(() => Account, (account) => account.videoPartitions)
  @JoinColumn({ name: "account_id" })
  account: Account;
  /**
   * 一个分区拥有多个视频
   */
  @OneToMany(() => Video, (video) => video.partition)
  videos: Video[];
  /**
   * 一个分区拥有多个视频合集
   */
  @OneToMany(() => VideoCollection, (vc) => vc.partition)
  videoCollections: VideoCollection[];
}
