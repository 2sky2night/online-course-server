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
import { VideoResolution } from "@src/module/file/enum";
import { File } from "@src/module/file/entity/file.entity";

/**
 * m3u8视频文件模型
 */
@Entity({ comment: "m3u8视频文件信息表" })
export class FileVideo {
  /**
   * id
   */
  @PrimaryGeneratedColumn({ comment: "m3u8视频id" })
  m3u8_id: number;
  /**
   * 存储路径
   */
  @Column({ comment: "m3u8视频文件存储的相对路径" })
  file_path: string;
  /**
   * 视频分辨率
   */
  @Column({
    type: "enum",
    enum: VideoResolution,
    comment: "视频分辨率",
    nullable: true,
  })
  resolution: VideoResolution | null;
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
   * 多个源的视频来自同一个文件
   */
  @ManyToOne(() => File, (file) => file.m3u8)
  @JoinColumn({ name: "file_id" })
  file: File;
}
