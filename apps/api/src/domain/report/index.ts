import Elysia, { t } from "elysia";
import { BaseResponse } from "../../utils/respone";
import { reportService } from "./services";

export const report = new Elysia({ prefix: "/report" }).get(
  "receipt/:id",
  async ({ set, params, query }) => {
    const bill = await reportService.receipt(params.id, set, query);
    return bill;
  },
  {
    params: BaseResponse.ParamsId,
    detail: {
      tags: ["Report"],
      summary: "Get report by ID",
      description: "Retrieve a specific report by its ID",
    },
    auth: true,
  },
);
