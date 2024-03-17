import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthMessage } from "@src/config/message";
import { UserToken } from "@src/types/common";
import { Request } from "express";
import { Observable } from "rxjs";

/**
 * 可选的用户身份校验
 */
@Injectable()
export class UserOptionalGuard implements CanActivate {
  private jwtService: JwtService;

  constructor() {
    this.jwtService = new JwtService();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;
    if (authorization === undefined) {
      return true;
    } else {
      const [type, token] = authorization.split(" ");
      if (type !== "Bearer") {
        // 非jwt类型的token或其他字符串
        throw new UnauthorizedException(AuthMessage.token_error);
      }
      // 解析token
      try {
        request.user_token = this.jwtService.verify<UserToken>(token, {
          secret: process.env.JSON_WEB_TOKEN_USER_SECRET,
        });
        return true;
      } catch (e) {
        // 解析失败
        throw new UnauthorizedException(AuthMessage.token_error);
      }
    }
  }
}
