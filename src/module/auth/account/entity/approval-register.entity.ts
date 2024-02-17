import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ApplyRegister } from "./index";
import { Account } from "@src/module/account/entity";

/**
 * 审批申请注册表
 */
@Entity({
  comment: "后台账户申请注册审批表",
})
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
  apply: Promise<ApplyRegister>;

  /**
   * 一个审批结果对应一个审核人
   */
  @ManyToOne(() => Account, (account) => account.register_approvals)
  @JoinColumn({ name: "account_id" })
  approval_account: Promise<Account>;
}
