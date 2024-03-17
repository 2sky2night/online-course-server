import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthMessage } from "@src/config/message";
import { AccountToken } from "@src/types/common";
import { Request } from "express";

/**
 * 后台账户守卫
 */
@Injectable()
export class AccountGuard implements CanActivate {
  private jwtService: JwtService;

  constructor() {
    this.jwtService = new JwtService();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.getToken(request);
    // 解析token
    try {
      request.account_token = await this.jwtService.verifyAsync<AccountToken>(
        token,
        {
          secret: process.env.JSON_WEB_TOKEN_ACCOUNT_SECRET,
        },
      );
      return true;
    } catch (error) {
      throw new UnauthorizedException(AuthMessage.token_error);
    }
  }

  /**
   * 从请求头部中读取token
   * @param req
   */
  getToken(req: Request) {
    const authorization = req.headers.authorization;
    if (authorization === undefined) {
      // 未携带token
      throw new UnauthorizedException(AuthMessage.token_empty);
    } else {
      const [type, token] = authorization.split(" ");
      if (type === "Bearer") {
        return token;
      } else {
        // 非jwt类型的token或其他字符串
        throw new UnauthorizedException(AuthMessage.token_error);
      }
    }
  }
}
