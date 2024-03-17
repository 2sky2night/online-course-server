import { IsNumber, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * 增加视频浏览历史记录dto
 */
export class AddVideoHistoryDto {
  /**
   * 观看的时长
   */
  @ApiProperty({
    description: "观看的时长",
  })
  @IsNumber({}, { message: "观看时长必须是数字型!" })
  @Min(0, { message: "观看时长必须大于等于0!" })
  viewing_time: number;
}
