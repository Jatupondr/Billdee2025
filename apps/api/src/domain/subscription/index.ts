import Elysia from "elysia";

import { BaseResponse } from "../../utils/respone";


import { subscriptionService } from "./service";
import { SubscriptionModel } from "./model";

export const subscription = new Elysia({ prefix: "/subscriptions" })
  .post(
    "/",
    async (c) => {
      const { body, set } = c;
      try {
        const response = await subscriptionService.create(body);
        set.status = 201;
        return {
          data: response,
          message: "Subscription created successfully",
        };
      } catch (error) {
        console.error(error);
        set.status = 500;
        throw new Error("Internal Server Error");
      }
    },
    {
      body: SubscriptionModel.subscriptionCreateDto,

      response: {
        201: BaseResponse.create,
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Subscription"],
        summary: "Create a new subscription",
        description: "Create a new subscription with the provided details",
      },
      auth: true,
    }
  )
  .get(
    "/listuser",
    async (c) => {
      const { query, set } = c;
      try {
        set.status = 200;
        const response = await subscriptionService.listUser(query);
        return {
          rows: response?.data,
          meta: response?.pagination,
          message: "Subscriptions List User successfully",
        };
      } catch (error) {
        throw error;
      }
    },
    {
      query: SubscriptionModel.subscriptionListUserQueryWithPagination,
      response: {
        // 200: BaseResponse.list(CustomerModel.customerResponseDto),
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Subscription"],
          summary: "list of subscriptions user",
        description: "list of subscriptions user with optional filtering and pagination",
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
        const response = await subscriptionService.findAll(query);
        return {
          rows: response?.data,
          meta: response?.pagination,
          message: "Subscriptions retrieved successfully",
        };
      } catch (error) {
        throw error;
      }
    },
    {
      query: SubscriptionModel.subscriptionQueryWithPagination,
      response: {
        // 200: BaseResponse.list(CustomerModel.customerResponseDto),
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Subscription"],
          summary: "list of subscriptions",
        description: "list of subscriptions with optional filtering and pagination",
      },
      auth: true,
    }
  )
  .get(
    "/:id",
    async (c) => {
      const { params, set } = c;
      try {
        const response = await subscriptionService.findById(params.id);
        return {
          data: response,
          message: "Subscription found successfully",
        };
      } catch (error) {
        throw error;
      }
    },
    {
      params: BaseResponse.ParamsId,
      response: {
         200: BaseResponse.success(SubscriptionModel.subscriptionResponseDto),
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
        tags: ["Subscription"],
        summary: "get a subscription by id",
        description: "get a subscription by id",
      },
      auth: true,
    }
  )
  .patch(
    "/cancel/:id",
    async (c) => {
      const { params, set } = c;
      try {
        const response = await subscriptionService.cancelSubscription(params.id);
        set.status = 200;
        return {
          data: response,
          message: "Subscription canceled successfully",
        };
      } catch (error) {
        throw error;
      }
    },
    {
      params: BaseResponse.ParamsId,
      response: {
        // 200: BaseResponse.success(CustomerModel.customerResponseDto),
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
          tags: ["Subscription"],
        summary: "cancel a subscription by id",
        description: "cancel a subscription by id",
      },
      auth: true,
    }
  )



  .patch(
    "/:id",
    async (c) => {
      const { params, body, set } = c;
      try {
        const response = await subscriptionService.update(params.id, body);
        set.status = 200;
        return {
          data: response,
          message: "Subscription updated successfully",
        };
      } catch (error) {
        throw error;
      }
    },
    {
      params: BaseResponse.ParamsId,
      body: SubscriptionModel.subscriptionUpdateDto,
      response: {
        // 200: BaseResponse.success(CustomerModel.customerResponseDto),
        400: BaseResponse.badRequest,
        403: BaseResponse.forbidden,
        401: BaseResponse.unauthorized,
        500: BaseResponse.internalServerError,
      },
      detail: {
          tags: ["Subscription"],
        summary: "update a subscription by id",
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


        const response = await subscriptionService.delete(params.id);
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
        tags: ["Subscription"],
        summary: "delete a subscription by id",
        description: "delete a subscription by id",
      },
      auth: true,
    }
  );
