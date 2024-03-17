import { RequestMethod } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

export class ResponseDto<TData> {
  @ApiProperty({
    description: "业务状态码",
    example: 200,
  })
  code: 200;
  @ApiProperty({
    description: "调用情况描述",
    example: "ok",
  })
  msg: "ok";

  data: TData;
}

export class ResponseEmptyDto {
  @ApiProperty({
    description: "业务状态码",
    example: 200,
  })
  code: 200;
  @ApiProperty({
    description: "调用情况描述",
    example: "ok",
  })
  msg: "ok";
  @ApiProperty({
    description: "响应的实际数据",
    example: null,
    nullable: true,
    type: "null",
  })
  data: null;
}

export class ResponseErrorDto {
  code: number;
  msg: string;
  timestamp: number;
  path: string;
  method: RequestMethod;
}

// 模型
export class BaseModel {
  @ApiProperty({
    description: "创建时间",
    example: "2024-02-23T04:13:20.428Z",
  })
  created_time: Date;

  @ApiProperty({
    description: "更新时间",
    example: "2024-02-23T04:13:20.428Z",
  })
  updated_time: Date;

  @ApiProperty({
    description: "删除时间",
    example: null,
    nullable: true,
  })
  deleted_time: Date;
}
