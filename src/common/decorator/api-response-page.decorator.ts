import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, getSchemaPath, ApiResponse } from "@nestjs/swagger";
import { ResponseDto } from "@src/types/docs";

export const ApiResponsePage = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(ResponseDto, model),
    ApiResponse({
      status: 200,
      description: "成功",
      content: {
        "application/json": {
          schema: {
            allOf: [
              { $ref: getSchemaPath(ResponseDto) },
              {
                properties: {
                  data: {
                    type: "object", // data的类型为object
                    properties: {
                      list: {
                        type: "array",
                        items: { $ref: getSchemaPath(model) }, // list的每个元素都是传入的模型
                      },
                      total: {
                        type: "number", // total的类型为number
                      },
                      has_more: {
                        type: "boolean",
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      },
    }),
  );
};
