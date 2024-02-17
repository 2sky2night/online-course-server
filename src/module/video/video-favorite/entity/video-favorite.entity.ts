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
import { User } from "@src/module/user/entity";
import { VideoRelationFavorite } from "@src/module/video/video-favorite/entity/video-relation-favorite.entity";

/**
 * 视频收藏夹表
 */
@Entity({ comment: "视频收藏夹表" })
export class VideoFavorite {
  /**
   * 收藏夹id
   */
  @PrimaryGeneratedColumn({ comment: "收藏夹id" })
  favorite_id: number;
  /**
   * 收藏夹名称
   */
  @Column({ comment: "收藏夹名称" })
  favorite_name: string;
  /**
   * 收藏夹描述
   */
  @Column({ comment: "收藏夹描述", nullable: true, type: "text" })
  description: string;
  /**
   * 创建者（一个用户可以创建多个收藏夹）
   */
  @ManyToOne(() => User, (user) => user.videoFavorites)
  @JoinColumn({ name: "user_id" })
  user: User;
  /**
   * 一个收藏夹可以包含多个视频收藏记录
   */
  @OneToMany(() => VideoRelationFavorite, (vrf) => vrf.favorite)
  videoRelation: VideoRelationFavorite[];
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
