import { FileVideo } from "@src/module/file/entity/file-video.entity";
import { FileType } from "@src/module/file/enum";
import { AccountUpload, UserUpload } from "@src/module/upload/entity";
import { Video } from "@src/module/video/video/entity";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * 文件模型
 */
@Entity({
  comment: "文件存储表",
})
export class File {
  /**
   * 文件的id
   */
  @PrimaryGeneratedColumn({ comment: "文件的id" })
  file_id: number;
  /**
   * 文件的hash
   */
  @Column({ comment: "文件的hash" })
  hash: string;
  /**
   * 文件存储的路径
   */
  @Column({ comment: "文件存储的路径" })
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
   * 一个文件对应多个后台用户上传记录
   */
  @OneToMany(() => AccountUpload, (upload) => upload.file)
  trace_accounts: AccountUpload[];

  /**
   * 一个文件对应多个前台用户上传记录
   */
  @OneToMany(() => UserUpload, (upload) => upload.file)
  trace_users: UserUpload[];

  /**
   * 一个文件可以对应多个发布的视频
   */
  @OneToMany(() => Video, (video) => video.file)
  videos: Video[];
  /**
   * 一个文件有多个视频源
   */
  @OneToMany(() => FileVideo, (fv) => fv.file)
  m3u8: FileVideo[];
}
