import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { VideoTag } from "@src/module/video/video-tag/entity/video-tag.entity";
import { Video } from "@src/module/video/video/entity";

/**
 * 视频和视频标签联系表
 */
@Entity({
  comment: "视频与视频标签关系表",
})
export class VideoRelationTag {
  /**
   * id
   */
  @PrimaryGeneratedColumn()
  trace_id: number;
  /**
   * 标签（一个标签有多个视频）
   */
  @ManyToOne(() => VideoTag, (vt) => vt.videoRelation)
  @JoinColumn({ name: "tag_id" })
  tag: VideoTag;
  /**
   * 视频(一个视频有多个标签)
   */
  @ManyToOne(() => Video, (video) => video.tagRelation)
  @JoinColumn({ name: "video_id" })
  video: Video;
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
