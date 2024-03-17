import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

/**
 * 第三方授权码登录
 */
export class OauthLoginDto {
  /**
   * 授权码
   */
  @ApiProperty({
    description: "授权码",
  })
  @IsString({ message: "授权码必须是字符串" })
  code: string;
}
