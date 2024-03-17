import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";

import { Role } from "../entity";
import { Roles } from "../enum";

@Injectable()
export class RoleService {
  /**
   * 角色表
   * @private
   */
  @InjectRepository(Role)
  private roleRepository: Repository<Role>;

  /**
   * 创建一个角色
   * @param role_name 角色名称
   * @return {Role} 角色实例
   */
  async create(role_name: Roles) {
    return this.roleRepository.save({ role_name });
  }

  /**
   * 通过角色名称查询一个角色
   * @param role_name 角色名称
   * @return {Promise<Role|null>} 角色实例
   */
  async findByName(role_name: Roles): Promise<Role | null> {
    return this.roleRepository.findOneBy({ role_name });
  }

  /**
   * 根据id查询角色
   * @param role_id 角色id
   */
  findById(role_id: number): Promise<Role | null> {
    return this.roleRepository.findOneBy({ role_id });
  }
}
