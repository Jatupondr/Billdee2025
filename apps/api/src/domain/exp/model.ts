import { t } from "elysia";
import { paginationBase } from "../../../share/pagination-base";
export namespace ExpModel {
  export const expCreateDto = t.Object({
    billExpenseNumber: t.String({
      minLength: 1,
      error: "Bill number is required",
    }),
    date: t.String({
      minLength: 1,
      error: "Date is required",
    }),

    items: t.Array(
      t.Object({
        no: t.Number(),

        name: t.String(),
        quantity: t.Number(),
        price: t.Number(),
        total: t.Number(),

      })
    ),
    customerId: t.String(),
    description: t.String(),
    slipUrl: t.Any(),
    total: t.Number(),
    organizationId: t.String({
      minLength: 1,
      error: "OrganizationId is required",
    }),

  });
  export const expUpdateDto = t.Object({
    billExpenseNumber: t.String({
      minLength: 1,
      error: "Bill number is required",
    }),
    date: t.String({
      minLength: 1,
      error: "Date is required",
    }),

    items: t.Array(
      t.Object({
        no: t.Number(),

        name: t.String(),
        quantity: t.Number(),
        price: t.Number(),
        total: t.Number(),

      })
    ),
    customerId: t.String(),
    description: t.String(),
    slipUrl: t.Any(),
    total: t.Number(),
    organizationId: t.String({
      minLength: 1,
      error: "OrganizationId is required",
    }),

  });

  export const expResponseDto = t.Object({
    _id: t.Any(),
    billExpenseNumber: t.String(),
    date: t.Date(),
    customerId: t.String(),
    items: t.Any(),
    description: t.String(),
    slipUrl: t.Any(),
    organizationId: t.Any(),
    total: t.Number(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    __v: t.Number(),
  });

  export const expQuery = t.Object({
    organizationId: t.Optional(t.String()),
  });

  // extend
  export const expQueryWithPagination = t.Composite([
    expQuery,
    paginationBase,
  ]);

  export const expQueryLastExpNumber = t.Object({
    organizationId: t.Optional(t.String()),

  });

  export type expCreateDto = typeof expCreateDto.static;
  export type expUpdateDto = typeof expUpdateDto.static;
  export type expResponseDto = typeof expResponseDto.static;
  export type expQueryLastExpNumber = typeof expQueryLastExpNumber.static;

  export type expQueryWithPagination = typeof expQueryWithPagination.static;
}
