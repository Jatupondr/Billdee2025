import { t } from "elysia";
export namespace OverviewModel {
  export const overviewQuery = t.Object({
    organizationId: t.Optional(t.String()),
    startDate: t.Optional(t.Date()),
    endDate: t.Optional(t.Date()),
    type: t.Optional(t.String({ enum: ["day", "month"] })),
  });
  export const overviewResponseDto = t.Object({});

  export type overviewQuery = typeof overviewQuery.static;
  export type overviewResponseDto = typeof overviewResponseDto.static;
}
