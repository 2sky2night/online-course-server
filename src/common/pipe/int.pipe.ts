import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { CommonMessage } from "@src/config/message";

/**
 * int管道
 */
@Injectable()
export class IntPipe implements PipeTransform<string | undefined, number> {
  /**
   * 参数字段的名称
   */
  param: string;

  /**
   * int管道
   * @param param 字段参数
   */
  constructor(param: string) {
    this.param = param;
  }

  transform(value: string) {
    if (value === undefined) {
      // 未输入此参数
      throw new BadRequestException(
        CommonMessage.int_pipe_empty_error(this.param),
      );
    }
    const format = Number(value);
    if (Number.isNaN(format)) {
      throw new BadRequestException(
        CommonMessage.int_pipe_type_error(this.param),
      );
    }
    return format;
  }
}
