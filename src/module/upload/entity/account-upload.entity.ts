import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Account } from "@src/module/account/entity";
import { FileType } from "@src/module/upload/enum";
import { Video } from "@src/module/video/entity";

/**
 * 前台账户上传资源追踪表
 */
@Entity()
export class AccountUpload {
  /**
   * 追踪id
   */
  @PrimaryGeneratedColumn({ comment: "上传记录的id" })
  trace_id: number;
  /**
   * 文件的hash
   */
  @Column({ comment: "文件的hash" })
  hash: string;

  /**
   * 文件的相对路径，基于存储的根路径
   */
  @Column({ comment: "文件存储的相对路径" })
  file_path: string;

  /**
   * 文件的类型
   */
  @Column({
    comment: "文件类型",
    nullable: true,
    enum: FileType,
    type: "enum",
  })
  file_type: FileType | null;

  /**
   * 创建时间
   */
  @CreateDateColumn({ type: "datetime", comment: "创建时间" })
  created_time: Date;

  /**
   * 上传资源的用户
   */
  @ManyToOne(() => Account, (account) => account.upload_files)
  @JoinColumn({ name: "account_id" })
  uploader: Promise<Account>;

  /**
   * 一个上传记录只能绑定一个视频
   */
  @OneToOne(() => Video, (video) => video.file)
  video: Promise<Video>;
}
