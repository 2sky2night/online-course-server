import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Video } from "@src/module/video/video/entity";
import { User } from "@src/module/user/entity";
import { VideoFavorite } from "@src/module/video/video-favorite/entity/video-favorite.entity";

/**
 * 用户收藏视频关系表
 */
@Entity({ comment: "用户收藏视频与视频收藏夹关系" })
export class VideoRelationFavorite {
  /**
   * 收藏追踪id
   */
  @PrimaryGeneratedColumn({ comment: "收藏追踪id" })
  trace_id: number;
  /**
   * 视频(一个视频可以被多个用户收藏)
   */
  @ManyToOne(() => Video, (video) => video.favoriteRelation)
  @JoinColumn({ name: "video_id" })
  video: Video;
  /**
   * 创建者（一个用户可以收藏多个视频）
   */
  @ManyToOne(() => User, (user) => user.favoriteVideoRelation)
  @JoinColumn({ name: "user_id" })
  user: User;
  /**
   * 收藏夹(一个收藏夹包含多个收藏记录)
   */
  @ManyToOne(() => VideoFavorite, (vf) => vf.videoRelation)
  @JoinColumn({ name: "favorite_id" })
  favorite: VideoFavorite;
  /**
   * 创建时间
   */
  @CreateDateColumn({ type: "datetime", comment: "创建时间" })
  created_time: Date;
  /**
   * 修改时间
   */
  @UpdateDateColumn({ type: "datetime", comment: "修改时间" })
  updated_time: Date;
  /**
   * 删除时间
   */
  @DeleteDateColumn({ type: "datetime", comment: "删除时间" })
  deleted_time: Date | null;
}
