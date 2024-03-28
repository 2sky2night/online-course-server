import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@src/module/account/module/role/entity";
import { Roles } from "@src/module/account/module/role/enum";
import { BaseModel } from "@src/types/docs";
import { AccountDto } from "@src/types/docs/account";
import { R_LoginDto } from "@src/types/docs/common";
import { RoleDto } from "@src/types/docs/role";

/**
 * 审批记录模型dto
 */
export class ApprovalLogDto extends BaseModel {
  @ApiProperty({ description: "审批id", example: 1 })
  trace_id: number;

  @ApiProperty({ description: "审批状态", example: true })
  status: boolean;
}

/**
 * 申请注册模型dto
 */
export class ApplyRegisterDto extends BaseModel {
  @ApiProperty({ description: "申请注册的id", example: 1 })
  apply_id: number;

  @ApiProperty({ description: "申请注册的用户名称", example: "JohnDoe" })
  account_name: string;

  @ApiProperty({
    description: "申请注册的原因",
    example: "Need access to exclusive content",
  })
  description: string;

  @ApiProperty({
    description: "申请注册时的邮箱",
    example: "example@example.com",
  })
  email: string;

  @ApiProperty({ description: "申请注册的角色", type: RoleDto })
  role: Role;
}

/**
 * 申请注册信息dto
 */
export class ApplyRegisterInfoDto extends ApplyRegisterDto {
  @ApiProperty({ description: "申请注册的角色", type: RoleDto })
  role: Role;
  @ApiProperty({ description: "审批的结果", type: ApprovalLogDto })
  approval: ApprovalLogDto;
}

/**
 * 审批记录信息dto
 */
export class ApprovalLogInfoDto extends ApprovalLogDto {
  @ApiProperty({ description: "申请记录", type: ApplyRegisterDto })
  apply: ApplyRegisterDto;
  @ApiProperty({ description: "审批的操作人", type: ApplyRegisterDto })
  approval_account: AccountDto;
}

export class R_LoginAccountDto extends R_LoginDto {}

export class R_ApplyAccountDto {
  @ApiProperty({
    description: "账户名",
  })
  username: string;

  @ApiProperty({
    description: "绑定的邮箱",
  })
  email: string;

  @ApiProperty({
    description: "申请注册原因",
  })
  description: string;

  @ApiProperty({
    description: "申请的角色",
    enum: [Roles.TEACHER, Roles.ADMIN],
  })
  role_name: Roles.TEACHER | Roles.ADMIN;
}

export class R_EmailAccountDto extends R_LoginDto {}
