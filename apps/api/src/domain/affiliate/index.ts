import Elysia from "elysia";

import { BaseResponse } from "../../utils/respone";

  import { AffiliateModel } from "./model";
import { affiliateService } from "./services";

export const affiliate = new Elysia({ prefix: "/affiliate" })

  .get(
    "/:id",
    async (c) => {
      const { params, set } = c;
      try {
        const response = await affiliateService.findById(params.id);
        return {
          data: response,
          message: "Affiliate found successfully",
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
        tags: ["Affiliate"],
        summary: "get a affiliate by id",
        description: "get a affiliate by id",
      },
      auth: true,
    }
  )
  .patch(
    "/:id",
    async (c) => {
      const { params, body, set } = c;
      try {
        const response = await affiliateService.update(params.id, body);
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
      body: AffiliateModel.affiliateUpdateDto,
      response: {
        // 200: BaseResponse.success(BillModel.billResponseDto),
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Affiliate"],
        summary: "update a affiliate by id",
        description: "update a affiliate by id",
      },
      auth: true,
    }
  )

 ;
