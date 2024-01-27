import { IsBoolean, IsNumber } from "class-validator";

/**
 * 审批申请注册传输对象
 */
export class ApprovalAccountDto {
  /**
   * 申请号
   */
  @IsNumber(undefined, { message: "申请号必须是数字!" })
  apply_id: number;
  /**
   * 审批状态
   */
  @IsBoolean({ message: "审批结果必须是布尔值!" })
  status: boolean;
}
