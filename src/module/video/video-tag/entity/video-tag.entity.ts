import { Account } from "@src/module/account/entity";
import { VideoCollectionRelationTag } from "@src/module/video/video-tag/entity/video-collection-relation-tag.entity";
import { VideoRelationTag } from "@src/module/video/video-tag/entity/video-relation-tag.entity";
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
 * 视频标签表
 */
@Entity({
  comment: "视频标签表",
})
export class VideoTag {
  /**
   * 标签id
   */
  @PrimaryGeneratedColumn({ comment: "标签id" })
  tag_id: number;
  /**
   * 标签名称
   */
  @Column({ comment: "标签的名称" })
  tag_name: string;
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
  /**
   * 标签创建者(一个管理员可以创建多个标签)
   */
  @ManyToOne(() => Account, (account) => account.videoTags)
  @JoinColumn({ name: "account_id" })
  account: Account;
  /**
   * 旗下的视频（一个标签可以包含多个视频）
   */
  @OneToMany(() => VideoRelationTag, (vrt) => vrt.tag)
  videoRelation: VideoRelationTag[];
  /**
   * 旗下的视频合集(一个标签可以包含多个视频合集)
   */
  @OneToMany(() => VideoCollectionRelationTag, (vcrt) => vcrt.tag)
  collectionRelation: VideoCollectionRelationTag[];
}
