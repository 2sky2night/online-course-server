import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRegisterType } from "@src/module/auth/module/user/entity";
import { Repository } from "typeorm";

@Injectable()
export class AuthUserService {
  @InjectRepository(UserRegisterType)
  private registerTypeRepository: Repository<UserRegisterType>;

  /**
   * 创建注册类型
   * @param register_platform 注册方式的名称
   */
  create(register_platform: string) {
    const item = this.registerTypeRepository.create({ register_platform });
    return this.registerTypeRepository.save(item);
  }

  /**
   * 根据注册名称获取平台信息
   * @param register_platform 注册方式的名称
   */
  findByName(register_platform: string) {
    return this.registerTypeRepository.findOneBy({ register_platform });
  }

  /**
   * 根据id获取注册平台信息
   * @param register_id 注册方式的id
   */
  findById(register_id: number) {
    return this.registerTypeRepository.findOneBy({ register_id });
  }
}
