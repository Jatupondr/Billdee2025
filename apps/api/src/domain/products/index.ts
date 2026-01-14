import Elysia from "elysia";
import { ProductModel } from "./model";

import { BaseResponse } from "../../utils/respone";
import { productService } from "./services";

export const product = new Elysia({ prefix: "/products" })
  .post(
    "/",
    async (c) => {
      const { body, set } = c;
      try {
        const response = await productService.create(body);
        set.status = 201;
        return {
          data: response,
          message: "Product created successfully",
        };
      } catch (error) {
        console.error(error);
        set.status = 500;
        throw new Error("Internal Server Error");
      }
    },
    {
      body: ProductModel.productCreateDto,

      response: {
        201: BaseResponse.create,
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Product"],
        summary: "Create a new product",
        description: "Create a new product with the provided details",
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
        const response = await productService.findAll(query);
        return {
          rows: response?.data,
          meta: response?.pagination,
          message: "Products retrieved successfully",
        };
      } catch (error) {
        throw error;
      }
    },
    {
      query: ProductModel.productQueryWithPagination,
      response: {
        // 200: BaseResponse.list(ProductModel.productResponseDto),
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Product"],
        summary: "list of products",
        description: "list of products with optional filtering and pagination",
      },
      auth: true,
    }
  )
  .get(
    "/:id",
    async (c) => {
      const { params, set } = c;
      try {
        const response = await productService.findById(params.id);
        return {
          data: response,
          message: "Product found successfully",
        };
      } catch (error) {
        throw error;
      }
    },
    {
      params: BaseResponse.ParamsId,
      response: {
        // 200: BaseResponse.success(ProductModel.productResponseDto),
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Product"],
        summary: "get a product by id",
        description: "get a product by id",
      },
      auth: true,
    }
  )
  .patch(
    "/:id",
    async (c) => {
      const { params, body, set } = c;
      try {
        const response = await productService.update(params.id, body);
        set.status = 200;
        return {
          data: response,
          message: "Product updated successfully",
        };
      } catch (error) {
        throw error;
      }
    },
    {
      params: BaseResponse.ParamsId,
      body: ProductModel.productUpdateDto,
      response: {
        // 200: BaseResponse.success(ProductModel.productResponseDto),
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Product"],
        summary: "update a product by id",
        description: "update a product by id",
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

        const response = await productService.delete(params.id);
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
        tags: ["Product"],
        summary: "delete a pr by id",
        description: "delete a product by id",
      },
      auth: true,
    }
  );
