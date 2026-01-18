import { t } from "elysia";
import { paginationBase } from "../../../share/pagination-base";
export namespace BillTemplateModel {

  export const billTemplateUpdateDto = t.Object({
    type: t.String({
      minLength: 1,
      error: "Type is required",
      enum: ["basic", "pro"],
    }),
    footerText: t.Optional(t.String()),
    footerSubText: t.Optional(t.String()),
    themcolor: t.Optional(t.String()),
    fontSize: t.Optional(t.Number()),
    typePage: t.Optional(t.String({
      enum: ["A4", "A3", "A5", "A6"],
      error: "Type page must be A4, A3, A5, or A6",
    })),
    pageOrientation: t.Optional(t.String({
      enum: ["portrait", "landscape"],
      error: "Page orientation must be portrait or landscape",
    })),
    pageMargins: t.Optional(t.Object({
      top: t.Optional(t.Number()),
      right: t.Optional(t.Number()),
      bottom: t.Optional(t.Number()),
      left: t.Optional(t.Number()),
    })),
    organizationId: t.String({
      minLength: 1,
      error: "OrganizationId is required",
    }),

  });

  export const billResponseDto = t.Object({
    _id: t.Any(),
    type: t.String(),
    footerText: t.String(),
    footerSubText: t.String(),
    themcolor: t.String(),
    fontSize: t.Number(),
    typePage: t.String(),
    pageOrientation: t.String(),
    pageMargins: t.Object({
      top: t.Number(),
      right: t.Number(),
      bottom: t.Number(),
      left: t.Number(),
    }),

    organizationId: t.Any(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    __v: t.Number(),
  });








  export type billTemplateUpdateDto = typeof billTemplateUpdateDto.static;
  export type billResponseDto = typeof billResponseDto.static;

}
