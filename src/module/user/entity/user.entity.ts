import { UserRegisterType } from "@src/module/auth/user/entity";
import { UserUpload } from "@src/module/upload/entity";
import { CollectionSubscribe } from "@src/module/video/collection-subsribe/entity";
import {
  VideoHistory,
  VideoLike,
  VideoView,
} from "@src/module/video/video/entity";
import {
  VideoComment,
  VideoCommentLike,
} from "@src/module/video/video-comment/entity";
import { VideoDanmu } from "@src/module/video/video-danmu/entity";
import {
  VideoFavorite,
  VideoRelationFavorite,
} from "@src/module/video/video-favorite/entity";
import {
  VideoReply,
  VideoReplyLike,
} from "@src/module/video/video-reply/entity";
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

/**
 * 用户表
 */
@Entity({
  comment: "前台用户表",
})
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
  likeVideos: VideoLike[];
  /**
   * 一个用户可以有发送多个视频评论
   */
  @OneToMany(() => VideoComment, (vc) => vc.user)
  videoComments: VideoComment[];
  /**
   * 一个用户可以产生多个点赞视频评论记录
   */
  @OneToMany(() => VideoCommentLike, (vcl) => vcl.user)
  likeVideoComments: VideoCommentLike[];
  /**
   * 一个用户可以发送多个回复
   */
  @OneToMany(() => VideoReply, (vr) => vr.user)
  videoReplies: VideoReply[];
  /**
   * 一个用户可以点赞多个回复
   */
  @OneToMany(() => VideoReplyLike, (vrl) => vrl.user)
  likeVideoReplies: VideoReplyLike[];
  /**
   * 收藏视频记录(一个用户可以收藏多个视频)
   */
  @OneToMany(() => VideoRelationFavorite, (vrf) => vrf.user)
  favoriteVideoRelation: VideoRelationFavorite[];
  /**
   * 视频收藏夹(一个用户可以创建多个收藏视频文件夹)
   */
  @OneToMany(() => VideoFavorite, (vf) => vf.user)
  videoFavorites: VideoFavorite[];
  /**
   * 订阅的视频合集记录(一个用户可以关注多个视频合集)
   */
  @OneToMany(() => CollectionSubscribe, (cs) => cs.user)
  subCollections: CollectionSubscribe[];
  /**
   * 弹幕（一个用户可以发布多个视频弹幕）
   */
  @OneToMany(() => VideoDanmu, (danmu) => danmu.user)
  videoDanmus: VideoDanmu[];
}
