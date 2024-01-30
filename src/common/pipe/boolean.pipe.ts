import { BadRequestException, PipeTransform } from "@nestjs/common";

/**
 * 布尔管道（默认：false）
 */
export class BooleanPipe implements PipeTransform<string | undefined, boolean> {
  /**
   * 参数名
   * @private
   */
  private readonly param: string;

  /**
   * 参数名(默认desc)
   * @param param
   */
  constructor(param = "desc") {
    this.param = param;
  }

  transform(value: string | undefined): boolean {
    if (value === undefined) return false;
    if (value === "true") {
      return true;
    } else if (value === "false") {
      return false;
    } else {
      throw new BadRequestException(this.param + "参数错误!");
    }
  }
}
