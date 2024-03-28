import { ApiProperty } from "@nestjs/swagger";
import { BaseModel } from "@src/types/docs";
import { RoleDto } from "@src/types/docs/role";

/**
 * 后台用户
 */
export class AccountDto extends BaseModel {
  @ApiProperty({ description: "账户ID", example: 1 })
  account_id: number;

  @ApiProperty({ description: "账户名", example: "john_doe" })
  account_name: string;

  @ApiProperty({ description: "头像", required: false, example: null })
  avatar: string | null;

  @ApiProperty({ description: "邮箱", example: "john@example.com" })
  email: string;
}

export class AccountInfoDto extends AccountDto {
  @ApiProperty({ description: "角色", type: RoleDto })
  role: RoleDto;
}
