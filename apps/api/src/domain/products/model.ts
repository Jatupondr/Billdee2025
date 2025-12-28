import { t } from "elysia";
import { paginationBase } from "../../../share/pagination-base";
export namespace ProductModel {
  export const productCreateDto = t.Object({
    name: t.String({ minLength: 1, error: "Name product is required" }),
    description: t.Optional(t.String()),
    price: t.Number({ minimum: 0, error: "Price product is required" }),
    cost: t.Number({ minimum: 0, error: "Cost product is required" }),
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

    updatedBy: t.String({ minLength: 1 }),
  });

  export const productResponseDto = t.Object({
    _id: t.String(),
    name: t.String(),
    description: t.Nullable(t.String()),
    price: t.Number(),
    cost: t.Number(),
    userId: t.String(),
    organizationId: t.String(),
    createdAt: t.String(),
    updatedAt: t.String(),
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
