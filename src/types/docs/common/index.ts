import { ApiProperty } from "@nestjs/swagger";

export class R_LoginDto {
  @ApiProperty({
    description: "令牌",
  })
  access_token: string;
}
