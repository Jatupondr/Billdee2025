import { t } from "elysia";
import { paginationBase } from "../../../share/pagination-base";
export namespace BillModel {
  export const billCreateDto = t.Object({
    name_customer: t.String({
      minLength: 1,
      error: "Name customer is required",
    }),
    phone_customer: t.String(),
    address_customer: t.String(),
    products: t.Array(
      t.Object({
        no: t.Number(),
        productId: t.Optional(t.String()),
        name: t.String(),
        quantity: t.Number(),
        price: t.Number(),
        total: t.Number(),
        note: t.Optional(t.String()),
      })
    ),
    customerId: t.String(),
    discount: t.Number(),
    total: t.Number(),
    note: t.String(),
    vat: t.Number(),
    discountPercent: t.Number(),
    includeVat: t.Boolean(),
    taxPercent: t.Number(),
    organizationId: t.String({
      minLength: 1,
      error: "OrganizationId is required",
    }),
    userId: t.String({ minLength: 1, error: "UserId is required" }),
  });
  export const billUpdateDto = t.Object({
    name_customer: t.Optional(t.String({ minLength: 1 })),
    phone_customer: t.Optional(t.String()),
    address_customer: t.Optional(t.String()),
    products: t.Optional(t.Any()),
    customerId: t.Optional(t.String()),
    discount: t.Optional(t.Number()),
    vat: t.Optional(t.Number()),
    total: t.Optional(t.Number()),
    note: t.Optional(t.String()),
    discountPercent: t.Optional(t.Number()),
    includeVat: t.Optional(t.Boolean()),
    taxPercent: t.Optional(t.Number()),
    organizationId: t.Optional(t.String({ minLength: 1 })),
    userId: t.Optional(t.String({ minLength: 1 })),
  });

  export const billResponseDto = t.Object({
    _id: t.Any(),
    name_customer: t.String(),
    phone_customer: t.String(),
    address_customer: t.String(),
    products: t.Any(),
    customerId: t.String(),
    discount: t.Number(),
    tax: t.Number(),
    total: t.Number(),
    note: t.String(),
    discountPercent: t.Number(),
    includeVat: t.Boolean(),
    taxPercent: t.Number(),
    userId: t.Any(),
    organizationId: t.Any(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    __v: t.Number(),
  });

  export const billQuery = t.Object({
    organizationId: t.Optional(t.String()),
  });

  // extend
  export const billQueryWithPagination = t.Composite([
    billQuery,
    paginationBase,
  ]);

  export type billCreateDto = typeof billCreateDto.static;
  export type billUpdateDto = typeof billUpdateDto.static;
  export type billResponseDto = typeof billResponseDto.static;

  export type billQueryWithPagination = typeof billQueryWithPagination.static;
}
