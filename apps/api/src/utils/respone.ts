import { t, type TSchema } from "elysia";

export namespace BaseResponse {
  // Base meta structure for pagination
  export const metaSchema = t.Object({
    total: t.Number(),
    page: t.Number(),
    pageSize: t.Number(),
  });

  export const ParamsId = t.Object({
    id: t.String({ minLength: 1, errorMessage: "ID is required" }),
  });

  export const success = <T extends TSchema>(dataSchema: T) =>
    t.Object({
      message: t.String({ default: "Success" }),
      data: dataSchema,
    });

  export const list = <T extends TSchema>(itemSchema: T) =>
    t.Object({
      rows: t.Array(itemSchema),
      meta: metaSchema,
    });

  export const successMessage = t.Object({
    message: t.String(),
  });
  export const badRequest = t.Object({
    message: t.String(),
  });
  export const unauthorized = t.Object({
    message: t.String(),
  });
  export const forbidden = t.Object({
    message: t.String(),
  });
  export const internalServerError = t.Object({
    message: t.String(),
  });

  export const noContent = t.Object({
    message: t.String(),
  });
}
