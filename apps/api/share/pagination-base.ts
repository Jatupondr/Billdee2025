import { t } from "elysia";

export const paginationBase = t.Object({
  page: t.Number({ minimum: 1, error: "page must Required" }),
  pageSize: t.Number({
    minimum: 1,
    error: "pageSize must Required",
  }),
  search: t.Optional(t.String()),
});
