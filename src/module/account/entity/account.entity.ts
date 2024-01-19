import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Role } from "@src/module/role/entity";

@Entity()
export class Account {
  /**
   * 账户id
   */
  @PrimaryGeneratedColumn({ comment: "账户id" })
  account_id: number;

  /**
   * 账户名称
   */
  @Column({ comment: "账户名称" })
  account_name: string;

  /**
   * 账户密码
   */
  @Column({ comment: "账户密码" })
  password: string;

  /**
   * 账户头像
   */
  @Column({ comment: "头像", nullable: true })
  avatar: string;

  /**
   * 账户邮箱
   */
  @Column({ comment: "邮箱" })
  email: string;

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
   * 一个账户拥有一个角色
   */
  @ManyToOne(() => Role, (role) => role.accounts)
  @JoinColumn({ name: "role_id" })
  role: Role;
}
