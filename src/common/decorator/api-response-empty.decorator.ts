import { applyDecorators } from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";
import { ResponseEmptyDto } from "@src/types/docs";

export const ApiResponseEmpty = () => {
  return applyDecorators(
    ApiOkResponse({
      type: ResponseEmptyDto,
    }),
  );
};
