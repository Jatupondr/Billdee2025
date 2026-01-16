import Elysia from "elysia";
import { OverviewModel } from "./model";

import { BaseResponse } from "../../utils/respone";
import { overviewService } from "./services";

export const overview = new Elysia({ prefix: "/overview" })
  .get(
    "/summary",
    async (c) => {
      const { query, set } = c;
      try {
        set.status = 200;
        return await overviewService.findAll(query);
      } catch (error) {
        throw error;
      }
    },
    {
      query: OverviewModel.overviewQuery,
      response: {
        // 200: BaseResponse.list(ProductModel.productResponseDto),
        // 400: BaseResponse.badRequest,
        // 403: BaseResponse.forbidden,
        // 401: BaseResponse.unauthorized,
        // 500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["overview"],
        summary: "Overview Summary Dashboard",
        description: "Overview summary Dashboard",
      },
      auth: true,
    }
  )
  .get(
    "/summary/customer",
    async (c) => {
      const { query, set } = c;
      try {
        set.status = 200;
        return await overviewService.findAllCustomer(query);
      } catch (error) {
        throw error;
      }
    },
    {
      query: OverviewModel.overviewQuery,
      response: {
        // 200: BaseResponse.list(ProductModel.productResponseDto),
        // 400: BaseResponse.badRequest,
        // 403: BaseResponse.forbidden,
        // 401: BaseResponse.unauthorized,
        // 500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["overview"],
        summary: "Overview Summary Customer Dashboard",
        description: "Overview summary Customer Dashboard",
      },
      auth: true,
    }
  )
  .get(
    "/summary/product",
    async (c) => {
      const { query, set } = c;
      try {
        set.status = 200;
        return await overviewService.findAllProduct(query);
      } catch (error) {
        throw error;
      }
    },
    {
      query: OverviewModel.overviewQuery,
      response: {
        // 200: BaseResponse.list(ProductModel.productResponseDto),
        // 400: BaseResponse.badRequest,
        // 403: BaseResponse.forbidden,
        // 401: BaseResponse.unauthorized,
        // 500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["overview"],
        summary: "Overview Summary Product Dashboard",
        description: "Overview summary Product Dashboard",
      },
      auth: true,
    }
  )
  .get(
    "/summary/chart",
    async (c) => {
      const { query, set } = c;
      try {
        set.status = 200;
        return await overviewService.findAllChart(query);
      } catch (error) {
        throw error;
      }
    },
    {
      query: OverviewModel.overviewQuery,
      response: {
        // 200: BaseResponse.list(ProductModel.productResponseDto),
        // 400: BaseResponse.badRequest,
        // 403: BaseResponse.forbidden,
        // 401: BaseResponse.unauthorized,
        // 500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["overview"],
        summary: "Overview Summary Chart Dashboard",
        description: "Overview summary Chart Dashboard",
      },
      auth: true,
    }
  );
