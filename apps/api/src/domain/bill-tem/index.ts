import Elysia from "elysia";

import { BaseResponse } from "../../utils/respone";

  import { BillTemplateModel } from "./model";
import { billTemplateService } from "./services";

export const billTemplate = new Elysia({ prefix: "/bill-template" })

  .get(
    "/:id",
    async (c) => {
      const { params, set } = c;
      try {
        const response = await billTemplateService.findById(params.id);
        return {
          data: response,
          message: "Bill Template found successfully",
        };
      } catch (error) {
        throw error;
      }
    },
    {
      params: BaseResponse.ParamsId,
      response: {
        // 200: BaseResponse.success(BillModel.billResponseDto),
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Bill Template"],
        summary: "get a bill template by id",
        description: "get a bill template by id",
      },
      auth: true,
    }
  )
  .patch(
    "/:id",
    async (c) => {
      const { params, body, set } = c;
      try {
        const response = await billTemplateService.update(params.id, body);
        set.status = 200;
        return {
          data: response,
          message: "Bill Template updated successfully",
        };
      } catch (error) {
        throw error;
      }
    },
    {
      params: BaseResponse.ParamsId,
      body: BillTemplateModel.billTemplateUpdateDto,
      response: {
        // 200: BaseResponse.success(BillModel.billResponseDto),
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Bill Template"],
        summary: "update a bill template by id",
        description: "update a bill template by id",
      },
      auth: true,
    }
  )

 ;
