import { User } from "@src/module/user/entity";
import { VideoCollection } from "@src/module/video/video-collection/entity";
import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * 用户订阅视频合集表
 */
@Entity({
  comment: "用户订阅视频合集表",
})
export class CollectionSubscribe {
  @PrimaryGeneratedColumn({ comment: "订阅追踪id" })
  trace_id: number;
  /**
   * 一个用户可以订阅多个合集
   */
  @ManyToOne(() => User, (user) => user.subCollections)
  @JoinColumn({ name: "user_id" })
  user: User;
  /**
   * 一个合集可以被多个用户订阅
   */
  @ManyToOne(() => VideoCollection, (vc) => vc.subscribedUsers)
  @JoinColumn({ name: "collection_id" })
  collection: VideoCollection;
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
}
