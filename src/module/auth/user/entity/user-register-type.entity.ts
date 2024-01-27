import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "@src/module/user/entity";

/**
 * 前台用户注册方式表
 */
@Entity()
export class UserRegisterType {
  /**
   * 注册类型id
   */
  @PrimaryGeneratedColumn({ comment: "注册类型id" })
  register_id: number;
  /**
   * 注册平台的名称
   */
  @Column({ comment: "注册类型的名称" })
  register_platform: string;

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
   * 一种注册方式有多个用户选择
   */
  @OneToMany(() => User, (user) => user.register_type)
  register_users: Promise<User[]>;
}
