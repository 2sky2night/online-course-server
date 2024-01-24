import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { Account } from "../entity";
import { RoleService } from "../module/role/service";
import { AccountMessage, RoleMessage } from "@src/config/message";

@Injectable()
export class AccountService {
  @InjectRepository(Account)
  private accountRepository: Repository<Account>;
  @Inject(RoleService)
  roleService: RoleService;

  /**
   * 创建账户
   * @param account_name 账户名称
   * @param encrypt_password 加密后的密钥
   * @param email 邮箱
   * @param role_id 角色id
   */
  async create(
    account_name: string,
    encrypt_password: string,
    email: string,
    role_id: number,
  ) {
    const exists = await this.findByName(account_name);
    if (exists === null) {
      // 账户名不存在
      const role = await this.roleService.findById(role_id);
      if (role) {
        // 角色存在，创建该账户
        const account = this.accountRepository.create({
          account_name,
          email,
          password: encrypt_password,
        });
        // 建立与角色的关系(延迟加载导致需要使用Promise类型)
        account.role = Promise.resolve(role);
        return this.accountRepository.save(account);
      } else {
        // 角色不存在
        throw new NotFoundException(RoleMessage.id_is_not_exists);
      }
    } else {
      // 账户名存在
      throw new BadRequestException(AccountMessage.name_exists);
    }
  }

  /**
   * 根据账户名查询账户是否存在
   * @param account_name 账户名
   * @return {Account|null} 账户实例
   */
  findByName(account_name: string): Promise<Account | null> {
    return this.accountRepository.findOneBy({ account_name });
  }

  /**
   * 通过邮箱查询此账户是否存在
   * @param email 邮箱
   */
  findByEmail(email: string) {
    return this.accountRepository.findOneBy({ email });
  }

  /**
   * 通过账户id查询账户
   * @param account_id 账户id
   */
  findById(account_id: number) {
    return this.accountRepository.findOneBy({ account_id });
  }
}
