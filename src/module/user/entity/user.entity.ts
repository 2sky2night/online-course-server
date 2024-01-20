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
import { UserRegisterType } from "@src/module/auth/module/user/entity";

/**
 * 用户表
 */
@Entity()
export class User {
  /**
   * 用户id
   */
  @PrimaryGeneratedColumn({ comment: "用户id" })
  user_id: number;

  /**
   * 用户在平台上的id
   */
  @Column({ comment: "对应平台的用户id" })
  platform_id: string;

  /**
   * 用户名称
   */
  @Column({ comment: "用户名称" })
  user_name: string;

  /**
   * 用户头像
   */
  @Column({ comment: "用户头像", nullable: true })
  avatar: string | null;

  /**
   * 用户性别
   */
  @Column({ comment: "用户性别", type: "boolean", nullable: true })
  gender: boolean | null;

  /**
   * 用户年龄
   */
  @Column({ comment: "用户年龄", type: "int", nullable: true })
  age: number | null;

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
   * 多种用户有一种注册方式
   */
  @ManyToOne(() => UserRegisterType, (type) => type.register_users)
  @JoinColumn({ name: "register_id" })
  register_type: Promise<UserRegisterType>;
}
