import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { AuthMessage } from "@src/config/message";
import { JwtService } from "@nestjs/jwt";

/**
 * 前台用户守卫
 */
@Injectable()
export class UserGuard implements CanActivate {
  private jwtService: JwtService;

  constructor() {
    this.jwtService = new JwtService();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.getToken(request);
    try {
      request.user_token = this.jwtService.verify(token, {
        secret: process.env.JSON_WEB_TOKEN_USER_SECRET,
      });
      return true;
    } catch (e) {
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
