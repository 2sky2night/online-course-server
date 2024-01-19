import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ApplyRegister } from "./index";

/**
 * 审批申请注册表
 */
@Entity()
export class ApprovalRegister {
  /**
   * 审批id
   */
  @PrimaryGeneratedColumn({ comment: "审批id" })
  trace_id: number;

  /**
   * 审批状态
   */
  @Column({ type: "boolean" })
  status: boolean;

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
   * 一个审批结果对应一个注册申请
   */
  @OneToOne(() => ApplyRegister)
  @JoinColumn({ name: "apply_id" })
  apply: ApplyRegister;
}
