import {
  createParamDecorator,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";
import { CommonMessage, ServerMessage } from "@src/config/message";
import type { Request } from "express";

/**
 * 从请求上下文的user_token中解析出数据
 */
export const UserToken = createParamDecorator(
  (data: "sub" | undefined, input: ExecutionContextHost) => {
    // data为装饰器调用时传入的参数，这里我们可以通过他结构出token中的某个属性
    const request = input.switchToHttp().getRequest<Request>();
    const tokenData = request.user_token;
    // 若中间件解析了token并保存在上下文中
    if (tokenData) {
      if (data === undefined) {
        // 不解析属性
        return tokenData;
      } else {
        if (Object.keys(tokenData).includes(data)) {
          return tokenData[data];
        } else {
          Logger.error(CommonMessage.get_token_data_error);
          throw new InternalServerErrorException(ServerMessage.server_error);
        }
      }
    } else {
      Logger.error(CommonMessage.get_token_data_empty);
      throw new InternalServerErrorException(ServerMessage.server_error);
    }
  },
);
