import { VideoCollection } from "@src/module/video/video-collection/entity";
import { VideoTag } from "@src/module/video/video-tag/entity/video-tag.entity";
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
 * 视频合集与标签关系表
 */
@Entity({
  comment: "视频合集与视频标签关系表",
})
export class VideoCollectionRelationTag {
  /**
   * id
   */
  @PrimaryGeneratedColumn()
  trace_id: number;
  /**
   * 标签(一个标签包含多个视频合集)
   */
  @ManyToOne(() => VideoTag, (vt) => vt.collectionRelation)
  @JoinColumn({ name: "tag_id" })
  tag: VideoTag;
  /**
   * 合集(一个合集包含多个标签)
   */
  @ManyToOne(() => VideoCollection, (vc) => vc.tagRelation)
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
  updated_time: Date;
  /**
   * 删除时间
   */
  @DeleteDateColumn({ type: "datetime", comment: "删除时间" })
  deleted_time: Date | null;
}
