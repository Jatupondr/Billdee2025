import { t } from "elysia";
import { paginationBase } from "../../../share/pagination-base";
import { Types } from "mongoose";
export namespace ProductModel {
  export const productCreateDto = t.Object({
    name: t.String({ minLength: 1, error: "Name product is required" }),
    description: t.Optional(t.String()),
    price: t.Number({ minimum: 0, error: "Price product is required" }),
    cost: t.Number({ minimum: 0, error: "Cost product is required" }),
    isRecommended: t.Optional(t.Boolean()),
    organizationId: t.String({
      minLength: 1,
      error: "OrganizationId is required",
    }),
    userId: t.String({ minLength: 1, error: "UserId is required" }),
  });
  export const productUpdateDto = t.Object({
    name: t.Optional(t.String({ minLength: 1 })),
    description: t.Optional(t.String()),
    price: t.Optional(t.Number({ minimum: 0 })),
    cost: t.Optional(t.Number({ minimum: 0 })),
    isRecommended: t.Optional(t.Boolean()),
    updatedBy: t.String({ minLength: 1 }),
  });

  export const productResponseDto = t.Object({
    _id: t.Any(),
    name: t.String(),
    description: t.Nullable(t.String()),
    price: t.Number(),
    cost: t.Number(),
    userId: t.Any(),
    status: t.Boolean(),
    organizationId: t.Any(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    isRecommended: t.Boolean(),
    __v: t.Number(),
  });

  export const productQuery = t.Object({
    organizationId: t.Optional(t.String()),
  });

  // extend
  export const productQueryWithPagination = t.Composite([
    productQuery,
    paginationBase,
  ]);

  export type productCreateDto = typeof productCreateDto.static;
  export type productUpdateDto = typeof productUpdateDto.static;
  export type productResponseDto = typeof productResponseDto.static;

  export type productQueryWithPagination =
    typeof productQueryWithPagination.static;
}
