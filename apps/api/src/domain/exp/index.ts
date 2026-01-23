import Elysia from "elysia";

import { BaseResponse } from "../../utils/respone";

import { ExpModel } from "./model";
import { expService } from "./services";

export const exp = new Elysia({ prefix: "/exp" })
  .post(
    "/",
    async (c) => {
      const { body, set } = c;
      try {
        const response = await expService.create(body);
        set.status = 201;
        return {
          data: response,
          message: "Exp created successfully",
        };
      } catch (error) {
        console.error(error);
        set.status = 500;

        throw new Error("Internal Server Error");
      }
    },
    {
      body: ExpModel.expCreateDto,

      response: {
        201: BaseResponse.create,
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Exp"],
        summary: "Create a new exp",
        description: "Create a new exp with the provided details",
      },
      auth: true,
    }
  )
  .get(
    "/",
    async (c) => {
      const { query, set } = c;
      try {
        set.status = 200;
        const response = await expService.findAll(query);
        return {
          rows: response?.data,
          meta: response?.pagination,
          message: "Exps retrieved successfully",
        };
      } catch (error) {
        throw error;
      }
    },
    {
        query: ExpModel.expQueryWithPagination,
      response: {
        // 200: BaseResponse.list(BillModel.billResponseDto),
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Exp"],
        summary: "list of exps",
        description: "list of exps with optional filtering and pagination",
      },
      auth: true,
    }
  )
  .get(
    "/:id",
    async (c) => {
      const { params, set } = c;
      try {
        const response = await expService.findById(params.id);
        return {
          data: response,
          message: "Exp found successfully",
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
        tags: ["Exp"],
        summary: "get a exp by id",
        description: "get a exp by id",
      },
      auth: true,
    }
  )
  .patch(
    "/:id",
    async (c) => {
      const { params, body, set } = c;
      try {
        const response = await expService.update(params.id, body);
        set.status = 200;
        return {
          data: response,
          message: "Exp updated successfully",
        };
      } catch (error) {
        throw error;
      }
    },
    {
      params: BaseResponse.ParamsId,
      body: ExpModel.expUpdateDto,
      response: {
        // 200: BaseResponse.success(BillModel.billResponseDto),
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
          tags: ["Exp"],
        summary: "update a exp by id",
        description: "update a exp by id",
      },
      auth: true,
    }
  )

  .get(
    "/lastexpnumber",
    async (c) => {
      const { query, set } = c;
      try {
        const response =
          await expService.getLastExpNumberByOrganizationId(query);
        return response;
      } catch (error) {
        throw error;
      }
    },
    {
      query: ExpModel.expQueryLastExpNumber,
      response: {
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Exp"],
        summary: "get last exp number by organization id",
        description: "get last exp number by organization id",
      },
      auth: true,
    }
  )
  .delete(
    "/:id/delete",
    async (c) => {
      const { params, set } = c;
      try {


        const response = await expService.delete(params.id);
        set.status = 200;
        return response;
      } catch (error) {
        throw error;
      }
    },
    {
      params: BaseResponse.ParamsId,
      response: {
        // 200: BaseResponse.noContent,
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Exp"],
        summary: "delete a exp by id",
        description: "delete a exp by id",
      },
      auth: true,
    }
  );
