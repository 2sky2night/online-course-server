import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class ApplyRegister {
  /**
   * 申请注册id
   */
  @PrimaryGeneratedColumn({ comment: "申请注册的id" })
  apply_id: number;

  /**
   * 申请注册的用户名称
   */
  @Column({ comment: "申请注册的用户名称" })
  account_name: string;

  /**
   * 申请注册的用户密码
   */
  @Column({ comment: "申请注册的用户密码" })
  password: string;

  /**
   * 申请注册的原因
   */
  @Column({ comment: "申请注册的原因" })
  description: string;

  /**
   * 申请注册的角色id
   */
  @Column({ comment: "申请注册的角色id" })
  role_id: number;

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
