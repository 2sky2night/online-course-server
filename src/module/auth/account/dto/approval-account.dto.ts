import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber } from "class-validator";

/**
 * 审批申请注册传输对象
 */
export class ApprovalAccountDto {
  /**
   * 申请号
   */
  @ApiProperty({
    description: "申请注册的id",
  })
  @IsNumber(undefined, { message: "申请号必须是数字!" })
  apply_id: number;

  /**
   * 审批的结果
   */
  @ApiProperty({
    description: "审批的结果",
  })
  @IsBoolean({ message: "审批结果必须是布尔值!" })
  status: boolean;
}
