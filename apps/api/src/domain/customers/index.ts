import Elysia from "elysia";

import { BaseResponse } from "../../utils/respone";

import { CustomerModel } from "./model";
import { customerService } from "./services";

export const customer = new Elysia({ prefix: "/customers" })
  .post(
    "/",
    async (c) => {
      const { body, set } = c;
      try {
        const response = await customerService.create(body);
        set.status = 201;
        return {
          data: response,
          message: "Customer created successfully",
        };
      } catch (error) {
        console.error(error);
        set.status = 500;
        throw new Error("Internal Server Error");
      }
    },
    {
      body: CustomerModel.customerCreateDto,

      response: {
        201: BaseResponse.create,
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Customer"],
        summary: "Create a new customer",
        description: "Create a new customer with the provided details",
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
        const response = await customerService.findAll(query);
        return {
          rows: response?.data,
          meta: response?.pagination,
          message: "Customers retrieved successfully",
        };
      } catch (error) {
        throw error;
      }
    },
    {
      query: CustomerModel.customerQueryWithPagination,
      response: {
        // 200: BaseResponse.list(CustomerModel.customerResponseDto),
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Customer"],
        summary: "list of customers",
        description: "list of customers with optional filtering and pagination",
      },
      auth: true,
    }
  )
  .get(
    "/:id",
    async (c) => {
      const { params, set } = c;
      try {
        const response = await customerService.findById(params.id);
        return {
          data: response,
          message: "Customer found successfully",
        };
      } catch (error) {
        throw error;
      }
    },
    {
      params: BaseResponse.ParamsId,
      response: {
        200: BaseResponse.success(CustomerModel.customerResponseDto),
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Customer"],
        summary: "get a customer by id",
        description: "get a customer by id",
      },
      auth: true,
    }
  )
  .patch(
    "/:id",
    async (c) => {
      const { params, body, set } = c;
      try {
        const response = await customerService.update(params.id, body);
        set.status = 200;
        return {
          data: response,
          message: "Customer updated successfully",
        };
      } catch (error) {
        throw error;
      }
    },
    {
      params: BaseResponse.ParamsId,
      body: CustomerModel.customerUpdateDto,
      response: {
        // 200: BaseResponse.success(CustomerModel.customerResponseDto),
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Customer"],
        summary: "update a customer by id",
        description: "update a customer by id",
      },
      auth: true,
    }
  )
  .delete(
    "/:id/delete",
    async (c) => {
      const { params, set } = c;
      try {
        console.log("data ==>", params.id);

        const response = await customerService.delete(params.id);
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
        tags: ["Customer"],
        summary: "delete a customer by id",
        description: "delete a customer by id",
      },
      auth: true,
    }
  );
