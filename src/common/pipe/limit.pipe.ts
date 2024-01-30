import { BadRequestException, PipeTransform } from "@nestjs/common";

/**
 * limit管道(默认:20)
 */
export class LimitPipe implements PipeTransform<string | undefined, number> {
  transform(value: string | undefined): number {
    if (value === undefined) return 20;
    const format = parseInt(value);
    if (Number.isNaN(format) || format <= 0) {
      throw new BadRequestException("limit参数错误!");
    }
    return format;
  }
}
