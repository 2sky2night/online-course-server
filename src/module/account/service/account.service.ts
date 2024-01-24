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
import {
  AccountMessage,
  CommonMessage,
  RoleMessage,
} from "@src/config/message";
import {
  UpdateAccountPasswordDto,
  UpdateAccountProfileDto,
} from "@src/module/account/dto";
import { passwordDecrypt, passwordEncrypt } from "@src/utils/crypto";

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
   * 必定查询到某个账户
   * @param account_id 账户id
   * @param needFind 标志
   */
  findById(account_id: number, needFind: true): Promise<Account>;
  /**
   * 通过账户id查询账户
   * @param account_id 账户id
   */
  findById(account_id: number): Promise<Account | null>;
  async findById(account_id: number, needFind?: true): Promise<Account | null> {
    const account = await this.accountRepository.findOneBy({ account_id });
    if (needFind && account === null) {
      throw new NotFoundException(AccountMessage.account_not_found);
    }
    return account;
  }

  /**
   * 更新用户信息
   * @param accountId 用户id
   * @param profileDto 更新字段
   */
  async updateProfile(accountId: number, profileDto: UpdateAccountProfileDto) {
    const account = await this.findById(accountId, true);
    if (profileDto.account_name) {
      // 修改了用户名
      // 查询用户名是否重复
      const isExists = await this.findByName(profileDto.account_name);
      if (isExists && isExists.account_id !== accountId) {
        // 用户名重复，但重复者是不是修改者，不允许修改
        throw new BadRequestException(AccountMessage.name_exists);
      }
    }
    await this.accountRepository.update(account.account_id, profileDto);
    return null;
  }

  /**
   * 更新账户密码
   * @param accountId 账户id
   * @param old_password 旧密码
   * @param password 新密码
   */
  async updatePassword(
    accountId: number,
    { old_password, password }: UpdateAccountPasswordDto,
  ) {
    const account = await this.findById(accountId, true);
    // 查询旧密码是否正确
    const raw_password = passwordDecrypt(account.password);
    if (raw_password !== old_password) {
      // 旧密码错误
      throw new BadRequestException(CommonMessage.password_error);
    }
    // 旧密码匹配正确，更新密码
    const key = passwordEncrypt(password);
    await this.accountRepository.update(accountId, { password: key });
    return null;
  }
}
