import Elysia from "elysia";
import { auth } from "../../lib/auth";

// ใช้ .use(betterAuth) ในทุก module ที่มี route `auth: true` / `admin: true`
// (auth.handler ถูก mount ไว้ที่ src/index.ts แล้ว จึงไม่ mount ซ้ำที่นี่)
export const betterAuth = new Elysia({ name: "better-auth" }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({
        headers,
      });

      if (!session) {
        return status(401, {
          success: false,
          message: "Unauthorized",
        });
      }

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
  admin: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({
        headers,
      });

      if (!session) {
        return status(401, {
          success: false,
          message: "Unauthorized",
        });
      }

      if (session.user.role !== "admin") {
        return status(403, {
          success: false,
          message: "Forbidden",
        });
      }

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});
