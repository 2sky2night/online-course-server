import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { AccountService } from "@src/module/account/service";
import { AuthMessage, CommonMessage } from "@src/config/message";
import { passwordDecrypt, passwordEncrypt } from "@src/utils/crypto";
import {
  ApplyRegister,
  ApprovalRegister,
} from "@src/module/auth/module/account/entity";
import { Roles } from "@src/module/role/enum";
import { RoleService } from "@src/module/role/service";
import { EmailService } from "@src/module/email/email.service";

@Injectable()
export class AuthAccountService {
  /**
   * 账户服务层
   * @private
   */
  @Inject(AccountService)
  private accountService: AccountService;
  /**
   * jwt服务层
   * @private
   */
  @Inject(JwtService)
  private jwtService: JwtService;
  /**
   * 角色服务层
   * @private
   */
  @Inject(RoleService)
  private roleService: RoleService;
  /**
   * 邮件服务层
   * @private
   */
  @Inject(EmailService)
  private emailService: EmailService;

  /**
   * 申请注册表
   * @private
   */
  @InjectRepository(ApplyRegister)
  private applyRepository: Repository<ApplyRegister>;
  /**
   * 审批注册表
   * @private
   */
  @InjectRepository(ApprovalRegister)
  private approvalRepository: Repository<ApprovalRegister>;

  /**
   * 登录
   * @param account_name 账户名称
   * @param password 密码
   */
  async login(account_name: string, password: string) {
    // 查询此账户名是否存在
    const account = await this.accountService.findByName(account_name);
    if (account === null) {
      // 账户名不存在
      throw new BadRequestException(AuthMessage.username_or_password_error);
    }
    // 解密密码，验证密码是否一致
    const raw_password = passwordDecrypt(account.password);
    if (raw_password !== password) {
      // 密码错误
      throw new BadRequestException(AuthMessage.username_or_password_error);
    }
    // 发放token
    const access_token = this.jwtService.sign({
      sub: account.account_id,
      role_name: (await account.role).role_name,
    });
    return {
      access_token,
    };
  }

  /**
   * 申请注册
   * @param account_name 账户名称
   * @param raw_password 原始密码
   * @param email 邮箱
   * @param description 申请原因
   * @param role_name 申请的角色名称
   */
  async apply(
    account_name: string,
    raw_password: string,
    email: string,
    description: string,
    role_name: Roles.ADMIN | Roles.TEACHER,
  ) {
    // 验证邮箱是否有效
    try {
      await this.emailService.sendApplyMsg(email);
    } catch (e) {
      Logger.error(`${CommonMessage.send_email_error}:${e.toString()}`);
      throw new BadRequestException(AuthMessage.email_send_error);
    }
    // 名称是否存在
    const nameExists = await this.accountService.findByName(account_name);
    if (nameExists) {
      throw new BadRequestException(AuthMessage.username_is_exists);
    }
    // 邮箱是否存在
    const emailExits = await this.accountService.findByEmail(email);
    if (emailExits) {
      throw new BadRequestException(AuthMessage.email_is_exists);
    }
    // 查询角色名称是否正确
    const role = await this.roleService.findByName(role_name);
    if (!role) {
      throw new BadRequestException(AuthMessage.role_name_is_error);
    }
    // 查询是否有此用户的申请记录-通过邮箱和账户名来确定唯一的一个申请用户
    const apply = await this.applyRepository.findOne({
      where: {
        email,
        account_name,
      },
      order: {
        // 倒叙查询最新地申请记录
        created_time: "desc",
      },
    });
    if (apply) {
      // 有此用户的申请记录
      const approval = await apply.approval;
      if (approval === null) {
        // 无人审批
        throw new BadRequestException(AuthMessage.wait_approval);
      }
      if (approval.status) {
        // 申请通过了
        throw new BadRequestException(AuthMessage.account_is_register);
      } else {
        // 申请未通过，则创建新地注册申请
        return this.createApply(
          account_name,
          passwordEncrypt(raw_password),
          email,
          description,
          role.role_id,
        );
      }
    } else {
      // 此用户无申请记录
      return this.createApply(
        account_name,
        passwordEncrypt(raw_password),
        email,
        description,
        role.role_id,
      );
    }
  }

  /**
   * 创建申请记录
   * @param account_name 账户名
   * @param password 加密后的密码
   * @param email 邮箱
   * @param description 申请描述
   * @param role_id 角色id
   */
  createApply(
    account_name: string,
    password: string,
    email: string,
    description: string,
    role_id: number,
  ) {
    const apply = this.applyRepository.create({
      account_name,
      password,
      email,
      role_id,
      description,
    });
    return this.applyRepository.save(apply);
  }

  /**
   * 创建审批记录
   * @param account_id 审批人
   * @param apply_id 申请号
   * @param status 审批状态
   */
  async createApproval(account_id: number, apply_id: number, status: boolean) {
    const apply = await this.applyRepository.findOneBy({ apply_id });
    if (apply === null) {
      // 申请号不存在!
      throw new NotFoundException(AuthMessage.apply_is_not_exists);
    }
    const approvalExists = await apply.approval;
    if (approvalExists) {
      // 此申请已经被审批过了
      throw new BadRequestException(AuthMessage.approvaled_error);
    }
    // 实例化审批记录
    const approval = this.approvalRepository.create({ status });
    // 审批人
    approval.approval_account = Promise.resolve(
      await this.accountService.findById(account_id),
    );
    // 绑定申请记录
    approval.apply = Promise.resolve(apply);
    // 创建审批记录
    await this.approvalRepository.save(approval);
    return approval;
  }

  /**
   * 审批注册申请并发送邮箱通知对应的账户
   * @param account_id 审批人
   * @param apply_id 申请号
   * @param status 审批状态
   */
  async approval(account_id: number, apply_id: number, status: boolean) {
    // 创建审批
    const approval = await this.createApproval(account_id, apply_id, status);
    // 获取申请数据
    const apply = await approval.apply;
    // 将此用户数据保存在账户表中
    await this.accountService.create(
      apply.account_name,
      apply.password,
      apply.email,
      apply.role_id,
    );
    // 发送邮件
    await this.emailService.sendApprovalEmail(
      apply.account_name,
      apply.email,
      status,
    );
    return null;
  }
}
