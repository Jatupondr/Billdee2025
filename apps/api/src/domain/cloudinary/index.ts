import Elysia, { t } from "elysia";
import { cloudinaryService } from "./cloudinaies.service";

export const cloudinary = new Elysia({
  prefix: "/cloudinary",
})
  .post(
    "/upload",
    async ({ body, set }) => {
      try {
        const file = await body.file;

        const result = await cloudinaryService.upload(file);

        set.status = 201;
        return result;
      } catch (error) {
        if (error instanceof Error) {
          set.status = 500;
          return {
            message: error.message,
            type: "INTERNAL_SERVER_ERROR",
          };
        }
        set.status = 500;
        return {
          message: "Internal server error",
          type: "INTERNAL_SERVER_ERROR",
        };
      }
    },
    {
      body: t.Object({
        file: t.File({
          type: "image",
        }),
        width: t.Any(), // ความกว้างที่ต้องการ (optional)
        quality: t.Any(), // คุณภาพของรูป (optional)
      }),
      detail: {
        tags: ["Cloudinary"],
        summary: "Upload and resize image to Cloudinary",
        description: "Upload image to Cloudinary with size optimization",
      },
      auth: true,
    }
  )
  .delete(
    "/delete-by-url",
    async ({ body, set }) => {
      try {
        const url = body.url;

        const result = await cloudinaryService.deleteByUrl(url);

        set.status = 200;
        return result;
      } catch (error) {
        console.error("Delete error:", error);
        set.status = 500;
        return {
          message: "Internal server error",
          type: "INTERNAL_SERVER_ERROR",
        };
      }
    },
    {
      body: t.Object({
        url: t.String(),
      }),
      detail: {
        tags: ["Cloudinary"],
        summary: "Delete image by URL",
        description: "Extract public_id from URL and delete the image",
      },
      auth: true,
    }
  );
