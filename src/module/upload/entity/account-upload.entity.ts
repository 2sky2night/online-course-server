import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Account } from "@src/module/account/entity";
import { File } from "@src/module/file/entity";

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
   * 上传资源的用户
   */
  @ManyToOne(() => Account, (account) => account.upload_files)
  @JoinColumn({ name: "account_id" })
  uploader: Account;

  /**
   * 一个上传记录对应一个文件
   */
  @ManyToOne(() => File, (file) => file.trace_accounts)
  @JoinColumn({ name: "file_id" })
  file: File;
}
