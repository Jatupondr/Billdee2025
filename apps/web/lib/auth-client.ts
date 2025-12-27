import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
export const authClient = createAuthClient({
  // @ts-ignore
  plugins: [organizationClient()],
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/auth`,
});
