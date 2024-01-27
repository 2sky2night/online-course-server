import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "@src/module/user/entity";
import { Repository } from "typeorm";
import type { UserRegisterType } from "@src/module/auth/user/entity";
import { UserMessage } from "@src/config/message";
import { UpdateUserProfileDto } from "@src/module/user/dto";

@Injectable()
export class UserService {
  /**
   * 前台用户表
   * @private
   */
  @InjectRepository(User)
  private userRepository: Repository<User>;

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
    const user = this.userRepository.create(
      avatar ? { avatar, platform_id, user_name } : { platform_id, user_name },
    );
    user.register_type = Promise.resolve(register);
    return this.userRepository.save(user);
  }

  /**
   * 根据平台id和注册方式id查询一个用户
   * @param platform_id 用户在此平台id
   * @param register_id 注册方式id
   */
  async findByPID_RID(platform_id: string, register_id: number) {
    const users = await this.userRepository.find({
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

  /**
   * 通过用户名称查询某个用户
   * @param user_name 用户名称
   */
  async findByName(user_name: string) {
    return this.userRepository.findOneBy({ user_name });
  }

  /**
   * 查询一个用户
   * @param user_id
   */
  async findByUID(user_id: number): Promise<User | null>;
  /**
   * 必定查询到此用户
   * @param user_id
   * @param needFind
   */
  async findByUID(user_id: number, needFind: true): Promise<User>;
  async findByUID(user_id: number, needFind?: true): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ user_id });
    if (needFind && user === null) {
      throw new BadRequestException(UserMessage.user_not_found);
    }
    return user;
  }

  /**
   * 更新用户信息
   * @param userId 要更新的用户
   * @param profileDto 更新提交的表单
   */
  async updateProfile(userId: number, profileDto: UpdateUserProfileDto) {
    const user = await this.findByUID(userId);
    if (profileDto.user_name) {
      // 查询用户是否重复
      const isExist = await this.findByName(profileDto.user_name);
      if (isExist && isExist.user_id !== user.user_id) {
        // 若重复者不是发起修改者，禁止修改
        throw new BadRequestException(UserMessage.name_exists);
      }
    }
    await this.userRepository.update(user.user_id, profileDto);
    return null;
  }
}
