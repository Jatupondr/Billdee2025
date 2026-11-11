import Elysia from "elysia";
import { betterAuth } from "../../plugins/better-auth";

import { BaseResponse } from "../../utils/respone";

import { BillModel } from "./model";
import { billService } from "./services";
import { billQuota } from "../billing/quota";

export const bill = new Elysia({ prefix: "/bills" })
  .use(betterAuth)
  .post(
    "/",
    async (c) => {
      const { body, set, user } = c as any;
      try {
        // แพ็กเกจฟรี: 10 บิล/เดือน (นับตามเดือนไทย) · Pro / แอดมิน ไม่จำกัด
        const quota = await billQuota(user);
        if (!quota.ok) {
          set.status = 403;
          return {
            code: "FREE_LIMIT",
            message: `แพ็กเกจฟรีออกบิลได้ ${quota.limit} บิลต่อเดือน — เดือนนี้ใช้ครบแล้ว อัปเกรดเป็น Pro เพื่อออกบิลไม่จำกัด`,
          } as any;
        }
        const response = await billService.create({ ...body, userId: user.id });
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
    "/summary",
    async (c) => {
      const { query, set } = c;
      set.status = 200;
      const data = await billService.monthSummary(query);
      return { data, message: "Summary retrieved successfully" };
    },
    {
      query: BillModel.billSummaryQuery,
      detail: {
        tags: ["Bill"],
        summary: "monthly summary",
        description: "Totals by status, profit and amount owed to each supplier for one month (Thai time)",
      },
      auth: true,
    }
  )
  .get(
    "/status-counts",
    async (c) => {
      const { query, set } = c;
      set.status = 200;
      return { data: await billService.statusCounts(query), message: "ok" };
    },
    {
      query: BillModel.billCountsQuery,
      detail: { tags: ["Bill"], summary: "bill counts per status" },
      auth: true,
    }
  )
  .patch(
    "/status",
    async (c) => {
      const { body, set } = c;
      const data = await billService.setStatusMany(body);
      set.status = 200;
      return { data, message: "Bill statuses updated" };
    },
    {
      body: BillModel.billBulkStatusDto,
      detail: { tags: ["Bill"], summary: "set the status of several bills" },
      auth: true,
    }
  )
  .patch(
    "/:id/status",
    async (c) => {
      const { params, body, set } = c;
      const data = await billService.setStatus(params.id, body);
      set.status = 200;
      return { data, message: "Bill status updated" };
    },
    {
      params: BaseResponse.ParamsId,
      body: BillModel.billStatusDto,
      detail: {
        tags: ["Bill"],
        summary: "set bill status",
        description: "pending / paid / credit (with dueDate) / canceled",
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
