import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "../lib/auth";

const app = new Elysia()
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
  .all("/api/auth/*", async (context) => {
    const { request, status } = context;
    if (["POST", "GET"].includes(request.method)) {
      return auth.handler(request);
    }
    return status(405);
  })
  .get("/", () => "Hello Elysia")
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
