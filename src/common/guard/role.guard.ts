import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CommonMessage, ServerMessage } from "@src/config/message";
import { Roles } from "@src/module/account/module/role/enum";
import type { Request } from "express";
import { Observable } from "rxjs";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 哪些角色可以访问此控制器
    const roles: Roles[] = this.reflector.get("roles", context.getHandler());
    if (!roles || roles.length === 0) {
      // 若无任何角色，则直接放行
      return true;
    }
    // 获取上下文中的解析出来的token数据
    const payload = context.switchToHttp().getRequest<Request>();
    if (payload.account_token) {
      if (roles.includes(payload.account_token.role_name as Roles)) {
        return true;
      } else {
        // 无权限
        throw new ForbiddenException(CommonMessage.forbidden);
      }
    } else {
      Logger.error(CommonMessage.get_token_data_empty);
      throw new InternalServerErrorException(ServerMessage.server_error);
    }
  }
}
