import Elysia from "elysia";

import { BaseResponse } from "../../utils/respone";

import { BillModel } from "./model";
import { billService } from "./services";

export const bill = new Elysia({ prefix: "/bills" })
  .post(
    "/",
    async (c) => {
      const { body, set } = c;
      try {
        const response = await billService.create(body);
        set.status = 201;
        return {
          data: response,
          message: "Bill created successfully",
        };
      } catch (error) {
        console.error(error);
        set.status = 500;

        throw new Error("Internal Server Error");
      }
    },
    {
      body: BillModel.billCreateDto,

      response: {
        201: BaseResponse.create,
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Bill"],
        summary: "Create a new bill",
        description: "Create a new bill with the provided details",
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
        const response = await billService.findAll(query);
        return {
          rows: response?.data,
          meta: response?.pagination,
          message: "Bills retrieved successfully",
        };
      } catch (error) {
        throw error;
      }
    },
    {
      query: BillModel.billQueryWithPagination,
      response: {
        // 200: BaseResponse.list(BillModel.billResponseDto),
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Bill"],
        summary: "list of bills",
        description: "list of bills with optional filtering and pagination",
      },
      auth: true,
    }
  )
  .get(
    "/:id",
    async (c) => {
      const { params, set } = c;
      try {
        const response = await billService.findById(params.id);
        return {
          data: response,
          message: "Bill found successfully",
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
        tags: ["Bill"],
        summary: "get a bill by id",
        description: "get a bill by id",
      },
      auth: true,
    }
  )
  .patch(
    "/:id",
    async (c) => {
      const { params, body, set } = c;
      try {
        const response = await billService.update(params.id, body);
        set.status = 200;
        return {
          data: response,
          message: "Bill updated successfully",
        };
      } catch (error) {
        throw error;
      }
    },
    {
      params: BaseResponse.ParamsId,
      body: BillModel.billUpdateDto,
      response: {
        // 200: BaseResponse.success(BillModel.billResponseDto),
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Bill"],
        summary: "update a bill by id",
        description: "update a bill by id",
      },
      auth: true,
    }
  )
  .get(
    "/lastbillnumber",
    async (c) => {
      const { query, set } = c;
      try {
        const response =
          await billService.getLastBillNumberByOrganizationIdAndUserId(query);
        return response;
      } catch (error) {
        throw error;
      }
    },
    {
      query: BillModel.billQueryLastBillNumber,
      response: {
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Bill"],
        summary: "get last bill number by organization id and user id",
        description: "get last bill number by organization id and user id",
      },
      auth: true,
    }
  )
  .delete(
    "/:id/delete",
    async (c) => {
      const { params, set } = c;
      try {


        const response = await billService.delete(params.id);
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
        tags: ["Bill"],
        summary: "delete a bill by id",
        description: "delete a bill by id",
      },
      auth: true,
    }
  );
