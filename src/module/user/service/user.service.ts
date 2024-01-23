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
   * @param avatar 用户头像
   */
  create(
    platform_id: string,
    user_name: string,
    register: UserRegisterType,
    avatar?: string | undefined,
  ) {
    const user = this.UserRepository.create(
      avatar ? { avatar, platform_id, user_name } : { platform_id, user_name },
    );
    user.register_type = Promise.resolve(register);
    return this.UserRepository.save(user);
  }

  /**
   * 根据平台id和注册方式id查询一个用户
   * @param platform_id 用户在此平台id
   * @param register_id 注册方式id
   */
  async findByPID_RID(platform_id: string, register_id: number) {
    const users = await this.UserRepository.find({
      where: {
        platform_id,
      },
      relations: {
        register_type: true,
      },
    });
    const user = users.find(async (user) => {
      const registerInfo = await user.register_type;
      return registerInfo.register_id === register_id;
    });
    if (user) {
      return user;
    } else {
      return null;
    }
  }
}
