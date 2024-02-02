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
import { UserRegisterType } from "@src/module/auth/user/entity";
import { UserUpload } from "@src/module/upload/entity";
import {
  VideoHistory,
  VideoLike,
  VideoView,
} from "@src/module/video/video/entity";
import {
  VideoComment,
  VideoCommentLike,
} from "@src/module/video/video-comment/entity";

/**
 * 用户表
 */
@Entity()
export class User {
  /**
   * 用户id
   */
  @PrimaryGeneratedColumn({ comment: "用户id" })
  user_id: number;

  /**
   * 用户在平台上的id
   */
  @Column({ comment: "对应平台的用户id" })
  platform_id: string;

  /**
   * 用户名称
   */
  @Column({ comment: "用户名称" })
  user_name: string;

  /**
   * 用户头像
   */
  @Column({ comment: "用户头像", nullable: true })
  avatar: string | null;

  /**
   * 用户性别
   */
  @Column({ comment: "用户性别", type: "boolean", nullable: true })
  gender: boolean | null;

  /**
   * 用户年龄
   */
  @Column({ comment: "用户年龄", type: "int", nullable: true })
  age: number | null;

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
   * 多种用户有一种注册方式
   */
  @ManyToOne(() => UserRegisterType, (type) => type.register_users)
  @JoinColumn({ name: "register_id" })
  register_type: Promise<UserRegisterType>;

  /**
   * 一个用户可以上传多个资源
   */
  @OneToMany(() => UserUpload, (upload) => upload.uploader)
  upload_files: Promise<UserUpload[]>;
  /**
   * 一个用户可以浏览多次浏览视频
   */
  @OneToMany(() => VideoView, (vv) => vv.user)
  videoViews: VideoView[];
  /**
   * 一个用户的视频浏览历史记录
   */
  @OneToMany(() => VideoHistory, (vh) => vh.video)
  videoHistories: VideoHistory[];
  /**
   * 一个用户可以点赞多个视频
   */
  @OneToMany(() => VideoLike, (vl) => vl.user)
  videoLikes: VideoLike[];
  /**
   * 一个用户可以有发送多个视频评论
   */
  @OneToMany(() => VideoComment, (vc) => vc.user)
  comments: VideoComment[];
  /**
   * 一个用户可以产生多个点赞评论记录
   */
  @OneToMany(() => VideoCommentLike, (vcl) => vcl.user)
  like_comments: VideoCommentLike[];
}
