import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "@src/module/user/entity";
import { Repository } from "typeorm";
import type { UserRegisterType } from "@src/module/auth/module/user/entity";

@Injectable()
export class UserService {
  /**
   * 前台用户表
   * @private
   */
  @InjectRepository(User)
  private UserRepository: Repository<User>;

  /**
   * 创建一个用户
   * @param platform_id 平台id
   * @param user_name 用户名称
   * @param register 注册方式实例
   */
  create(platform_id: string, user_name: string, register: UserRegisterType) {
    const user = this.UserRepository.create({ platform_id, user_name });
    user.register_type = Promise.resolve(register);
    return this.UserRepository.save(user);
  }

  findByPID_RID() {
    // 根据平台id和注册id查询一个用户
  }
}
