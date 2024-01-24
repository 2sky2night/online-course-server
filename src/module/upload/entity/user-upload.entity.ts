import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "@src/module/user/entity";

/**
 * 前台账户上传资源追踪表
 */
@Entity()
export class UserUpload {
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
   * 创建时间
   */
  @CreateDateColumn({ type: "datetime", comment: "创建时间" })
  created_time: Date;

  /**
   * 上传资源的用户，一个资源对应一个上传的用户
   */
  @ManyToOne(() => User, (user) => user.upload_files)
  @JoinColumn({ name: "user_id" })
  uploader: Promise<User>;
}
