import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { serverTiming } from "@elysiajs/server-timing";
import { openapi } from "@elysiajs/openapi";
import { auth } from "../lib/auth";
import { betterAuth } from "./plugins/better-auth";
import { product } from "./domain/products";
import { customer } from "./domain/customers";

const app = new Elysia({
  prefix: "/api",
  normalize: true,
})
  .onError(({ error, code, status }) => {
    if (code === "NOT_FOUND")
      return status(404, { success: false, message: error.message });
    if (code === "INTERNAL_SERVER_ERROR")
      return status(500, { success: false, message: error.message });
    if (code === "VALIDATION")
      return status(400, { success: false, message: error.message });
  })
  .use(
    cors({
      origin: process.env.CORS_ORIGIN,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Origin",
      ],
    })
  )
  .mount(auth.handler)
  .use(
    openapi({
      path: "docs",
      documentation: {
        // components: await OpenAPI.components,
        // paths: await OpenAPI.getPaths(),
        info: {
          title: "billdee API",
          version: "1.0.0",
          description:
            "billdee API v2 is a RESTful API for the billdee project.",
        },
      },
    })
  )
  .use(serverTiming())
  .all(
    "/api/auth/*",
    async (context) => {
      const { request, status } = context;
      if (["POST", "GET"].includes(request.method)) {
        return auth.handler(request);
      }
      return status(405);
    },
    {
      detail: {
        hide: true,
      },
    }
  )
  // .get("/", () => "Hello Elysia")
  .use(product)
  .use(customer)
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
