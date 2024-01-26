import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Video } from "@src/module/video/entity/video.entity";

/**
 * 视频集合（课程）
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
  @Column({ comment: "合集的描述" })
  description: string;
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
   * 一个集合包含多个视频
   */
  @OneToMany(() => Video, (video) => video.collection)
  videos: Promise<Video[]>;
}
