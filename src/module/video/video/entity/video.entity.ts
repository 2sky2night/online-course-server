import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Account } from "@src/module/account/entity";
import { VideoCollection } from "@src/module/video/video-collection/entity";
import { File } from "@src/module/file/entity";

@Entity()
export class Video {
  /**
   * 视频id
   */
  @PrimaryGeneratedColumn({ comment: "视频id" })
  video_id: number;
  /**
   * 视频名称
   */
  @Column({ comment: "视频名称" })
  video_name: string;
  /**
   * 视频描述
   */
  @Column({ comment: "视频描述", nullable: true })
  description: string | null;
  /**
   * 创建时间
   */
  @CreateDateColumn({ type: "datetime", comment: "创建时间" })
  created_time: Date;
  /**
   * 修改时间
   */
  @UpdateDateColumn({ type: "datetime", comment: "修改时间" })
  updated_time: Date | null;
  /**
   * 删除时间
   */
  @DeleteDateColumn({ type: "datetime", comment: "删除时间" })
  deleted_time: Date | null;
  /**
   * 多个视频对应一个上传者
   */
  @ManyToOne(() => Account, (account) => account.publish_videos)
  @JoinColumn({ name: "account_id" })
  publisher: Promise<Account>;
  /**
   * 多个发布的视频可以来自与同一个文件
   */
  @ManyToOne(() => File, (file) => file.videos)
  @JoinColumn({ name: "file_id" })
  file: Promise<File>;
  /**
   * 一个视频可以来自多个视频合集夹
   */
  @ManyToMany(() => VideoCollection, (vc) => vc.videos)
  collections: Promise<VideoCollection[]>;
}
