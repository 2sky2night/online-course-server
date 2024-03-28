import { ApiProperty } from "@nestjs/swagger";
import { Roles } from "@src/module/account/module/role/enum";
import { BaseModel } from "@src/types/docs";

/**
 * 角色信息
 */
export class RoleDto extends BaseModel {
  @ApiProperty({ description: "角色id", example: 1 })
  role_id: number;

  @ApiProperty({ description: "角色名称", enum: Roles })
  role_name: string;
}
