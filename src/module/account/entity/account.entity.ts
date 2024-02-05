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
import { Role } from "@src/module/account/module/role/entity";
import { ApprovalRegister } from "@src/module/auth/account/entity";
import { AccountUpload } from "@src/module/upload/entity";
import { Video } from "@src/module/video/video/entity";
import { VideoCollection } from "@src/module/video/video-collection/entity";
import { VideoPartition } from "@src/module/video/video-partition/entity";

/**
 * 账户表
 */
@Entity()
export class Account {
  /**
   * 账户id
   */
  @PrimaryGeneratedColumn({ comment: "账户id" })
  account_id: number;

  /**
   * 账户名称
   */
  @Column({ comment: "账户名称" })
  account_name: string;

  /**
   * 账户密码
   */
  @Column({ comment: "账户密码", select: false })
  password: string;

  /**
   * 账户头像
   */
  @Column({ comment: "头像", nullable: true })
  avatar: string;

  /**
   * 账户邮箱
   */
  @Column({ comment: "邮箱" })
  email: string;

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
   * 一个账户拥有一个角色(开启延迟加载，读取角色数据)
   */
  @ManyToOne(() => Role, (role) => role.accounts)
  @JoinColumn({ name: "role_id" })
  role: Promise<Role>;

  /**
   * 一个账户可以审核多个申请注册的记录
   */
  @OneToMany(() => ApprovalRegister, (app) => app.approval_account)
  register_approvals: Promise<ApprovalRegister[]>;

  /**
   * 一个账户可以上传多个文件
   */
  @OneToMany(() => AccountUpload, (upload) => upload.uploader)
  upload_files: Promise<AccountUpload[]>;

  /**
   * 一个用户可以上传多个视频
   */
  @OneToMany(() => Video, (video) => video.publisher)
  publish_videos: Promise<Video[]>;

  /**
   * 一个用户可以创建多个视频合集
   */
  @OneToMany(() => VideoCollection, (vc) => vc.creator)
  collections: Promise<VideoCollection[]>;
  /**
   * 一个管理员可以创建多个视频分区
   */
  @OneToMany(() => VideoPartition, (vp) => vp.account)
  videoPartitions: VideoPartition[];
}
