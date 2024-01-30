import { BadRequestException, PipeTransform } from "@nestjs/common";

/**
 * offset管道（默认:0）
 */
export class OffsetPipe implements PipeTransform<string | undefined, number> {
  transform(value: string | undefined): number {
    if (value === undefined) return 0;
    const format = parseInt(value);
    if (Number.isNaN(format) || format < 0) {
      throw new BadRequestException("offset参数错误!");
    }
    return format;
  }
}
