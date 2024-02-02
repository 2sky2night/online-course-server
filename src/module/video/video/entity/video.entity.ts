import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Account } from "@src/module/account/entity";
import { VideoCollection } from "@src/module/video/video-collection/entity";
import { File } from "@src/module/file/entity";
import { VideoView } from "@src/module/video/video/entity/video-view.entity";
import { VideoHistory } from "@src/module/video/video/entity/video-history.entity";
import { VideoLike } from "@src/module/video/video/entity/video-like.entity";
import { VideoComment } from "@src/module/video/video-comment/entity";

/**
 * 视频表
 */
@Entity()
export class Video {
  /**
   * 视频id
   */
  @PrimaryGeneratedColumn({ comment: "视频id" })
  video_id: number;
  /**
   * 视频名称
   */
  @Column({ comment: "视频名称" })
  video_name: string;
  /**
   * 视频封面
   */
  @Column({ comment: "视频封面", nullable: true })
  video_cover: string | null;
  /**
   * 视频描述
   */
  @Column({ comment: "视频描述", nullable: true, type: "text" })
  description: string | null;
  /**
   * 视频时长
   */
  @Column({ comment: "视频时长，秒为单位", type: "float" })
  duration: number;
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
   * 多个视频对应一个上传者
   */
  @ManyToOne(() => Account, (account) => account.publish_videos)
  @JoinColumn({ name: "account_id" })
  publisher: Account;
  /**
   * 多个发布的视频可以来自与同一个文件
   */
  @ManyToOne(() => File, (file) => file.videos)
  @JoinColumn({ name: "file_id" })
  file: File;
  /**
   * 一个视频可以来自多个视频合集夹
   */
  @ManyToMany(() => VideoCollection, (vc) => vc.videos)
  collections: VideoCollection[];
  /**
   * 一个视频有多个浏览量
   */
  @OneToMany(() => VideoView, (vv) => vv.video)
  views: VideoView[];
  /**
   * 一个视频有多个用户产生的历史记录
   */
  @OneToMany(() => VideoHistory, (vh) => vh.video)
  histories: VideoHistory[];
  /**
   * 一个视频可以被多个用户点赞
   */
  @OneToMany(() => VideoLike, (vl) => vl.video)
  likes: VideoLike[];
  /**
   * 一个视频有多个评论
   */
  @OneToMany(() => VideoComment, (vc) => vc.video)
  comments: VideoComment[];
}
