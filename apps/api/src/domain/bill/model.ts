import { t } from "elysia";
import { paginationBase } from "../../../share/pagination-base";
export namespace BillModel {
  export const billCreateDto = t.Object({
    billNumber: t.String({
      minLength: 1,
      error: "Bill number is required",
    }),
    date: t.String({
      minLength: 1,
      error: "Date is required",
    }),
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
        cost: t.Optional(t.Number()),
        total: t.Number(),
        note: t.Optional(t.String()),
        supplier: t.Optional(t.String({ maxLength: 100 })),
      })
    ),
    customerId: t.String(),
    discount: t.Number(),
    cost: t.Number(),
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
    textIdCustomer: t.Optional(t.String())  ,
    phoneCustomer: t.Optional(t.String()),
    addressCustomer: t.Optional(t.String()),
    provinceCustomer: t.Optional(t.String()),
    districtCustomer: t.Optional(t.String()),
    subDistrictCustomer: t.Optional(t.String()),
    postalCodeCustomer: t.Optional(t.String()),
    taxIdCustomer: t.Optional(t.String()),
  });
  export const billUpdateDto = t.Object({
    billNumber: t.String({
      minLength: 1,
      error: "Bill number is required",
    }),
    date: t.String({
      minLength: 1,
      error: "Date is required",
    }),
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
        cost: t.Optional(t.Number()),
        total: t.Number(),
        note: t.Optional(t.String()),
        supplier: t.Optional(t.String({ maxLength: 100 })),
      })
    ),
    customerId: t.String(),
    discount: t.Number(),
    total: t.Number(),
    note: t.String(),
    cost: t.Number(),
    vat: t.Number(),
    discountPercent: t.Number(),
    includeVat: t.Boolean(),
    taxPercent: t.Number(),
    organizationId: t.String({
      minLength: 1,
      error: "OrganizationId is required",
    }),
    userId: t.String({ minLength: 1, error: "UserId is required" }),
    textIdCustomer: t.Optional(t.String())  ,
    phoneCustomer: t.Optional(t.String()),
    addressCustomer: t.Optional(t.String()),
    provinceCustomer: t.Optional(t.String()),
    districtCustomer: t.Optional(t.String()),
    subDistrictCustomer: t.Optional(t.String()),
    postalCodeCustomer: t.Optional(t.String()),
    taxIdCustomer: t.Optional(t.String()),
  });

  export const billResponseDto = t.Object({
    _id: t.Any(),
    billNumber: t.String(),
    date: t.Date(),
    name_customer: t.String(),
    phone_customer: t.String(),
    address_customer: t.String(),
    products: t.Any(),
    customerId: t.String(),
    discount: t.Number(),
    tax: t.Number(),
    total: t.Number(),
    note: t.String(),
    cost: t.Number(),
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
    status: t.Optional(
      t.Union([
        t.Literal("pending"),
        t.Literal("paid"),
        t.Literal("credit"),
        t.Literal("canceled"),
        t.Literal("overdue"),
      ])
    ),
  });

  export const billStatusDto = t.Object({
    organizationId: t.String({ minLength: 1 }),
    status: t.Union([
      t.Literal("pending"),
      t.Literal("paid"),
      t.Literal("credit"),
      t.Literal("canceled"),
    ]),
    // YYYY-MM-DD (ใช้กับเครดิต)
    dueDate: t.Optional(t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" })),
  });

  export const billBulkStatusDto = t.Object({
    organizationId: t.String({ minLength: 1 }),
    ids: t.Array(t.String({ minLength: 1 }), { minItems: 1, maxItems: 200 }),
    status: t.Union([
      t.Literal("pending"),
      t.Literal("paid"),
      t.Literal("credit"),
      t.Literal("canceled"),
    ]),
    dueDate: t.Optional(t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" })),
  });

  export const billCountsQuery = t.Object({
    organizationId: t.String({ minLength: 1 }),
  });

  export const billSummaryQuery = t.Object({
    organizationId: t.String({ minLength: 1 }),
    // YYYY-MM (เวลาไทย)
    month: t.String({ pattern: "^\\d{4}-(0[1-9]|1[0-2])$" }),
  });

  // extend
  export const billQueryWithPagination = t.Composite([
    billQuery,
    paginationBase,
  ]);

  export const billQueryLastBillNumber = t.Object({
    organizationId: t.Optional(t.String()),
    userId: t.Optional(t.String()),
  });

  export type billCreateDto = typeof billCreateDto.static;
  export type billUpdateDto = typeof billUpdateDto.static;
  export type billResponseDto = typeof billResponseDto.static;
  export type billQueryLastBillNumber = typeof billQueryLastBillNumber.static;

  export type billQueryWithPagination = typeof billQueryWithPagination.static;
  export type billStatusDto = typeof billStatusDto.static;
  export type billBulkStatusDto = typeof billBulkStatusDto.static;
  export type billCountsQuery = typeof billCountsQuery.static;
  export type billSummaryQuery = typeof billSummaryQuery.static;
}
