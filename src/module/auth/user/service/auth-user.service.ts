import {
  Injectable,
  Inject,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import { UserRegisterType } from "@src/module/auth/user/entity";
import { UserService } from "@src/module/user/service";
import { RegisterType, registerTypeConfig } from "src/config/oauth";
import {
  Github as GithubOAuth,
  Gitee as GiteeOAuth,
  Alipay as AlipayOAuth,
} from "@src/lib/oauth";
import { AuthMessage, ServerMessage } from "@src/config/message";
import { generateCode } from "@src/utils/tools";
import { EmailService } from "@src/module/email/email.service";
import { RedisService } from "@src/module/redis/redis.service";
import * as process from "process";

@Injectable()
export class AuthUserService {
  /**
   * jwt服务层
   * @private
   */
  @Inject(JwtService)
  private jwtService: JwtService;
  /**
   * 环境变量配置项
   * @private
   */
  @Inject(registerTypeConfig.KEY)
  private registerConfig: ConfigType<typeof registerTypeConfig>;
  /**
   * 注册方式表
   * @private
   */
  @InjectRepository(UserRegisterType)
  private registerTypeRepository: Repository<UserRegisterType>;
  /**
   * github第三方登录的API
   * @private
   */
  @Inject("GITHUB_OAUTH")
  private githubOAuth: GithubOAuth;
  /**
   * 前台用户服务层
   * @private
   */
  @Inject(UserService)
  private userService: UserService;
  /**
   * gitee第三方登录的API
   * @private
   */
  @Inject("GITEE_OAUTH")
  private giteeOAuth: GiteeOAuth;
  /**
   * 支付宝第三方登录的API
   * @private
   */
  @Inject("ALIPAY_OAUTH")
  private alipayOAuth: AlipayOAuth;
  /**
   * 邮箱服务层
   * @private
   */
  @Inject(EmailService)
  private emailService: EmailService;
  /**
   * redis服务层
   * @private
   */
  @Inject(RedisService)
  private redisService: RedisService;

  /**
   * github登录
   * @param code 授权码
   */
  async githubLogin(code: string) {
    try {
      // 1.获取用户的token
      const { data: token } = await this.githubOAuth.getToken(code);
      // 2.根据token获取用户信息
      const { data: userInfo } = await this.githubOAuth.getUserInfo(
        token.access_token,
      );
      // 查询github的注册类型实例
      const registerType = await this.findByName(RegisterType.GITHUB);
      // 构造用户的平台id
      const platform_id = String(userInfo.id);
      // 3.查询用户信息是否注册过了
      const isExist = await this.userService.findByPID_RID(
        platform_id,
        registerType.register_id,
      );
      if (isExist === null) {
        // 4.不存在用户，则注册用户，并下发token
        const user = await this.userService.create(
          platform_id,
          `github用户_${userInfo.id}`,
          registerType,
          userInfo.avatar_url ? userInfo.avatar_url : undefined,
        );
        return {
          access_token: this.signAccessToken(user.user_id),
        };
      } else {
        // 4.存在此平台的用户了，直接下发token
        return {
          access_token: this.signAccessToken(isExist.user_id),
        };
      }
    } catch (e) {
      if (e.response?.status === 401) {
        // 授权码无效
        throw new BadRequestException(AuthMessage.auth_code_error);
      } else {
        Logger.error(`${ServerMessage.server_error}:${e.toString()}`);
        throw new InternalServerErrorException(ServerMessage.server_error);
      }
    }
  }

  /**
   * gitee登录
   * @param code 授权码
   */
  async giteeLogin(code: string) {
    try {
      // 获取用户token
      const {
        data: { access_token },
      } = await this.giteeOAuth.getToken(code);
      // 获取用户信息
      const { data: userInfo } = await this.giteeOAuth.getUserInfo(
        access_token,
      );
      // 构造用户的id
      const platform_id = String(userInfo.id);
      // 获取gitee注册的平台数据
      const register = await this.findByName(RegisterType.GITEE);
      // 查询当前用户是否注册过了
      const isExists = await this.userService.findByPID_RID(
        platform_id,
        register.register_id,
      );
      if (isExists) {
        // 注册过了，直接下发token
        return {
          access_token: this.signAccessToken(isExists.user_id),
        };
      } else {
        // 未注册，则注册，并发下token
        const user = await this.userService.create(
          platform_id,
          `gitee用户_${userInfo.id}`,
          register,
          userInfo.avatar_url,
        );
        return {
          access_token: this.signAccessToken(user.user_id),
        };
      }
    } catch (e) {
      if (e.response?.status === 401) {
        // 授权码无效
        throw new BadRequestException(AuthMessage.auth_code_error);
      } else {
        Logger.error(`${ServerMessage.server_error}:${e.toString()}`);
        throw new InternalServerErrorException(ServerMessage.server_error);
      }
    }
  }

  /**
   * 支付宝登录
   * @param code 授权码
   */
  async alipayLogin(code: string) {
    try {
      // 获取token
      const { accessToken } = await this.alipayOAuth.getToken(code);
      // 获取用户信息
      const userInfo = await this.alipayOAuth.getUserInfo(accessToken);
      // 获取注册平台的信息
      const register = await this.findByName(RegisterType.ALIPAY);
      // 查询用户是否注册过
      const isExist = await this.userService.findByPID_RID(
        userInfo.openId,
        register.register_id,
      );
      if (isExist) {
        // 注册过，直接下发token
        return {
          access_token: this.signAccessToken(isExist.user_id),
        };
      } else {
        // 未注册过，注册，并发下token
        const user = await this.userService.create(
          userInfo.openId,
          `支付宝用户_${userInfo.openId}`,
          register,
          userInfo.avatar ? userInfo.avatar : undefined,
        );
        return {
          access_token: this.signAccessToken(user.user_id),
        };
      }
    } catch (e) {
      if (e.serverResult?.data) {
        // 支付宝jdk请求错误
        const result = JSON.parse(e.serverResult.data);
        if (result.error_response?.code === "40002") {
          throw new BadRequestException(AuthMessage.auth_code_error);
        }
      }
      Logger.error(`${ServerMessage.server_error}:${e.toString()}`);
      throw new InternalServerErrorException(ServerMessage.server_error);
    }
  }

  /**
   * 给邮箱发送登录验证码
   * @param email 邮箱地址
   */
  async sendEmailCode(email: string): Promise<null> {
    // 1.生成验证码
    const code = generateCode();
    try {
      // 发送验证码
      await this.emailService.sendCode(email, code);
    } catch (e) {
      // 邮箱发送失败
      Logger.error(e);
      throw new BadRequestException(AuthMessage.email_code_send_error);
    }
    // 2.注册用户
    // 获取邮箱登录的注册方式
    const register = await this.findByName(RegisterType.EMAIL);
    // 查询此用户是否注册过;
    const isExist = await this.userService.findByPID_RID(
      email,
      register.register_id,
    );
    if (isExist === null) {
      // 未创建用户，则创建用户
      await this.userService.create(email, `邮箱用户_${email}`, register);
    }
    // 3.保存验证码(五分钟内有效)
    await this.redisService.setEx(
      `user-email-login-code:${email}`,
      code,
      Number(process.env.EMAIL_LOGIN_CODE_TIME),
    );
    return null;
  }

  /**
   * 邮箱验证码登录
   * @param email 邮箱
   * @param code 验证码
   */
  async emailLogin(email: string, code: string) {
    const key = `user-email-login-code:${email}`;
    // 查询此邮箱是否有获取验证码的记录
    const value = await this.redisService.get(key);
    if (value === null) {
      // 此邮箱的验证码失效或未申请
      throw new BadRequestException(AuthMessage.email_code_error);
    }
    if (value === code) {
      // 邮箱验证码匹配正确
      // 删除验证码
      await this.redisService.del(key);
      // 查询用户消息
      const register = await this.findByName(RegisterType.EMAIL);
      const user = await this.userService.findByPID_RID(
        email,
        register.register_id,
      );
      return {
        access_token: this.signAccessToken(user.user_id),
      };
    } else {
      // 匹配错误
      throw new BadRequestException(AuthMessage.email_code_error);
    }
  }

  /**
   * 下发token
   * @param uid 用户id
   */
  signAccessToken(uid: number) {
    return this.jwtService.sign({ sub: uid });
  }

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
