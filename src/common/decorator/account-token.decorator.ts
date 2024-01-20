import {
  createParamDecorator,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";
import type { Request } from "express";
import { CommonMessage, ServerMessage } from "@src/config/message";

export const AccountToken = createParamDecorator(
  (data: "sub" | "role_name" | undefined, input: ExecutionContextHost) => {
    // data为装饰器调用时传入的参数，这里我们可以通过他结构出token中的某个属性
    const request = input.switchToHttp().getRequest<Request>();
    const tokenData = request.account_token;
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
