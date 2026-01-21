import { t } from "elysia";
import { paginationBase } from "../../../share/pagination-base";
;
export namespace SubscriptionModel {
  export const subscriptionCreateDto = t.Object({
    plan: t.String({ minLength: 1, error: "Plan is required" }),
    status: t.String({
      enum: ["paid", "unpaid", "expired", "canceled"],
      default: "paid",
    }),
    startDate: t.Date(),
    endDate: t.Date(),
    expDate: t.Optional(t.Date()),
    userId: t.String({ minLength: 1, error: "UserId is required" }),
  });
  export const subscriptionUpdateDto = t.Object({
    plan: t.Optional(t.String({ minLength: 1 })),
    status: t.Optional(t.String({ enum: ["paid", "unpaid", "expired", "canceled"], default: "paid" })),
    startDate: t.Optional(t.Date()),
    endDate: t.Optional(t.Date()),
    expDate: t.Optional(t.Date()),
    userId: t.Optional(t.String({ minLength: 1 })),
  });

  export const subscriptionResponseDto = t.Object({
    _id: t.Any(),
    plan: t.String(),
    status: t.String(),
    startDate: t.Optional(t.Date()),
    endDate: t.Optional(t.Date()),
    expDate: t.Optional(t.Date()),
    userId: t.Any(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    __v: t.Number(),
  });

  export const subscriptionQuery = t.Object({
    userId: t.Optional(t.String({ minLength: 1 })),
    status: t.Optional(t.String()),
  });
  export const subscriptionListUserQuery = t.Object({
    search: t.Optional(t.String()),
  });

  // extend
  export const subscriptionQueryWithPagination = t.Composite([
    subscriptionQuery,
    paginationBase,
  ]);

  export const subscriptionListUserQueryWithPagination = t.Composite([
    subscriptionListUserQuery,
    paginationBase,
  ]);

  export type subscriptionCreateDto = typeof subscriptionCreateDto.static;
  export type subscriptionUpdateDto = typeof subscriptionUpdateDto.static;
  export type subscriptionResponseDto = typeof subscriptionResponseDto.static;
  export type subscriptionListUserQuery = typeof subscriptionListUserQuery.static;
  export type subscriptionListUserQueryWithPagination = typeof subscriptionListUserQueryWithPagination.static;
  export type subscriptionQueryWithPagination =
    typeof subscriptionQueryWithPagination.static;
}
