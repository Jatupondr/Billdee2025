import { t } from "elysia";

export namespace AffiliateModel {

  export const affiliateUpdateDto = t.Object({
    userId: t.String({
      minLength: 1,
      error: "UserId is required",
    }),


    referalCode: t.Optional(t.String()),
    referalLink: t.Optional(t.String()),

  });

  export const affiliateResponseDto = t.Object({
    _id: t.Any(),
    status: t.String({
      enum: ["active", "inactive"],
      default: "inactive",
    }),

    userId: t.Any(),
    referalCode: t.String(),
    referalLink: t.String(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    __v: t.Number(),
  });








  export type affiliateUpdateDto = typeof affiliateUpdateDto.static;
  export type affiliateResponseDto = typeof affiliateResponseDto.static;

}
