import { createAuthClient } from "better-auth/react";
import {
  inferOrgAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { inferAdditionalFields } from "better-auth/client/plugins";
export const authClient = createAuthClient({
  // @ts-ignore
  plugins: [
    organizationClient({
      schema: inferOrgAdditionalFields({
        organization: {
          additionalFields: {
            phone: {
              type: "string",
            },
            taxId: {
              type: "string",
            },
            email: {
              type: "string",
            },
            note: {
              type: "string",
            },
            address: {
              type: "string",
            },
            province: {
              type: "string",
            },
            district: {
              type: "string",
            },
            subDistrict: {
              type: "string",
            },
            postalCode: {
              type: "string",
            },
            account_no: {
              type: "string",
            },
            account_name: {
              type: "string",
            },
            prompt_pay: {
              type: "string",
            },
            bank_name: {
              type: "string",
            },
          },
        },
      }),
    }),
  ],
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/auth`,
});
