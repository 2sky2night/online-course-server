import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinTable,
  JoinColumn,
  ManyToMany,
} from "typeorm";
import { Video } from "@src/module/video/video/entity";
import { Account } from "@src/module/account/entity";

/**
 * 视频合集（课程）
 */
@Entity()
export class VideoCollection {
  /**
   * 视频合集id
   */
  @PrimaryGeneratedColumn({ comment: "视频合集id" })
  collection_id: number;
  /**
   * 合集的名称
   */
  @Column({ comment: "合集的名称" })
  collection_name: string;
  /**
   * 合集的描述
   */
  @Column({ comment: "合集的描述", nullable: true })
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
   * 一个合集创建者可以创建多个合集
   */
  @ManyToOne(() => Account, (account) => account.collections)
  @JoinColumn({ name: "account_id" })
  creator: Promise<Account>;
  /**
   * 一个视频合集有多个视频
   */
  @ManyToMany(() => Video, (video) => video.collections)
  @JoinTable({
    name: "video_relation_video_collection",
    joinColumn: {
      // joinColumns为应当参照当前模型的字段
      name: "collection_id",
      referencedColumnName: "collection_id",
    },
    inverseJoinColumn: {
      name: "video_id",
      referencedColumnName: "video_id",
    },
  })
  videos: Promise<Video[]>;
}
