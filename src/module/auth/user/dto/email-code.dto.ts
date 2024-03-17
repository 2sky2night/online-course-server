import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class EmailCodeDto {
  @ApiProperty({
    description: "邮箱地址",
  })
  @IsEmail(undefined, { message: "邮箱地址必须合法" })
  email: string;
}
