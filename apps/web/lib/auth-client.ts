import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // @ts-ignore
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/auth`,
});
