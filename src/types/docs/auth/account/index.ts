import { ApiProperty } from "@nestjs/swagger";
import { Roles } from "@src/module/account/module/role/enum";
import { R_LoginDto } from "@src/types/docs/common";

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
