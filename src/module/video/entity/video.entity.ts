import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Account } from "@src/module/account/entity";
import { AccountUpload } from "@src/module/upload/entity";
import { VideoCollection } from "@src/module/video/entity/video-collection.entity";

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
   * 一个视频对应一个文件上传记录
   */
  @OneToOne(() => AccountUpload)
  @JoinColumn({ name: "file_trace_id" })
  file: Promise<AccountUpload>;

  /**
   * 多个视频对应一个上传者
   */
  @ManyToOne(() => Account, (account) => account.upload_videos)
  @JoinColumn({ name: "account_id" })
  uploader: Promise<Account>;
  /**
   * 多个视频来自与一个视频集合
   */
  @ManyToOne(() => VideoCollection, (collection) => collection.videos)
  @JoinColumn({ name: "collection_id" })
  collection: Promise<VideoCollection>;
}
