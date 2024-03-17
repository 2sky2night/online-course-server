import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { ResponseDto } from "@src/types/docs";

export const ApiResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(ResponseDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDto) },
          {
            properties: {
              data: {
                type: "object", // data的类型为object
                $ref: getSchemaPath(model), // 其模型为传入的模型
              },
            },
          },
        ],
      },
    }),
  );
};
