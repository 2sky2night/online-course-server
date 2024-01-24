import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from "typeorm";
import { Account } from "@src/module/account/entity";
import { Roles } from "../enum";

@Entity()
export class Role {
  /**
   * 角色id
   */
  @PrimaryGeneratedColumn({ comment: "角色id" })
  role_id: number;

  /**
   * 角色名称
   */
  @Column({ comment: "角色名称", type: "enum", enum: Roles })
  role_name: Roles;

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
   * 一个角色有多个账户
   */
  @OneToMany(() => Account, (account) => account.role)
  accounts: Account[];
}
