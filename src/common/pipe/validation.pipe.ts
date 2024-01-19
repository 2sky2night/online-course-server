import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import type { Type } from "@nestjs/common";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CommonMessage } from "@src/config/message";

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      // 如果没有传入验证规则，则不验证，直接返回数据
      return value;
    }
    // object为传入的表单值（请求体或装饰的目标参数）
    const object = plainToInstance(metatype, value);
    // 通过值去校验表单
    const errors = await validate(object);

    // 出现错误了
    if (errors.length > 0) {
      if (errors[0].constraints) {
        // 获取校验失败的原因
        const tips = Object.values(errors[0].constraints)[0];
        throw new BadRequestException(
          CommonMessage.validation_error_with_tips(tips),
        );
      } else {
        throw new BadRequestException(CommonMessage.validation_error);
      }
    }
    return value;
  }

  private toValidate(metatype: Type<any>): boolean {
    const types: Type<any>[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
