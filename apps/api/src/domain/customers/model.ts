import { t } from "elysia";
import { paginationBase } from "../../../share/pagination-base";
import { Types } from "mongoose";
export namespace CustomerModel {
  export const customerCreateDto = t.Object({
    name: t.String({ minLength: 1, error: "Name customer is required" }),
    typeCustomer: t.Optional(
      t.String({
        enum: ["customer", "supplier"],
        default: "customer",
      })
    ),
    address: t.Optional(t.String()),
    province: t.Optional(t.String()),
    district: t.Optional(t.String()),
    subDistrict: t.Optional(t.String()),
    postalCode: t.Optional(t.String()),
    taxId: t.Optional(t.String()),
    phone: t.Optional(t.String()),
    organizationId: t.String({
      minLength: 1,
      error: "OrganizationId is required",
    }),
    userId: t.String({ minLength: 1, error: "UserId is required" }),
  });
  export const customerUpdateDto = t.Object({
    name: t.Optional(t.String({ minLength: 1 })),
    typeCustomer: t.Optional(
      t.String({
        enum: ["customer", "supplier"],
        default: "customer",
      })
    ),
    address: t.Optional(t.String()),
    province: t.Optional(t.String()),
    district: t.Optional(t.String()),
    subDistrict: t.Optional(t.String()),
    postalCode: t.Optional(t.String()),
    taxId: t.Optional(t.String()),
    phone: t.Optional(t.String()),
    organizationId: t.Optional(t.String({ minLength: 1 })),
    userId: t.Optional(t.String({ minLength: 1 })),

    // updatedBy: t.String({ minLength: 1 }),
  });

  export const customerResponseDto = t.Object({
    _id: t.Any(),
    name: t.String(),
    typeCustomer: t.String(),
    userId: t.Any(),
    address: t.Optional(t.String()),
    province: t.Optional(t.String()),
    district: t.Optional(t.String()),
    subDistrict: t.Optional(t.String()),
    postalCode: t.Optional(t.String()),
    taxId: t.Optional(t.String()),
    phone: t.Optional(t.String()),
    organizationId: t.Any(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    __v: t.Number(),
  });

  export const customerQuery = t.Object({
    organizationId: t.Optional(t.String()),
    typeCustomer: t.Optional(t.String()),
  });

  // extend
  export const customerQueryWithPagination = t.Composite([
    customerQuery,
    paginationBase,
  ]);

  export type customerCreateDto = typeof customerCreateDto.static;
  export type customerUpdateDto = typeof customerUpdateDto.static;
  export type customerResponseDto = typeof customerResponseDto.static;

  export type customerQueryWithPagination =
    typeof customerQueryWithPagination.static;
}
