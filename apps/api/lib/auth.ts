import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "./db";
import { admin, haveIBeenPwned, lastLoginMethod, multiSession, openAPI, organization } from "better-auth/plugins";

export const auth = betterAuth({
  database: mongodbAdapter(client),
  basePath: "/api/auth",
  trustedOrigins: [process.env.CORS_ORIGIN!],
  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
        input: true,
      },
      referralCode: {
        type: "string",
        input: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
		maxPasswordLength: 20,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
      domain: process.env.MODE === "development" ? "localhost" : ".billdee.net",
    },
  },
  rateLimit: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  plugins: [
    openAPI(),
    multiSession({
      maximumSessions: 2,
    }),
    lastLoginMethod(),
    haveIBeenPwned(),
    organization({
      schema: {
        organization: {
          additionalFields: {
            phone: {
              type: "string",
              input: true,
              required: false,
            },
            taxId: {
              type: "string",
              input: true,
              required: false,
            },
            email: {
              type: "string",
              input: true,
              required: false,
            },
            note: {
              type: "string",
              input: true,
              required: false,
            },
            address: {
              type: "string",
              input: true,
              required: false,
            },
            province: {
              type: "string",
              input: true,
              required: false,
            },
            district: {
              type: "string",
              input: true,
              required: false,
            },
            subDistrict: {
              type: "string",
              input: true,
              required: false,
            },
            postalCode: {
              type: "string",
              input: true,
              required: false,
            },
            account_no: {
              type: "string",
              input: true,
              required: false,
            },

            account_name: {
              type: "string",
              input: true,
              required: false,
            },
            prompt_pay: {
              type: "string",
              input: true,
              required: false,
            },
            bank_name: {
              type: "string",
              input: true,
              required: false,
            },
          },
        },
      },
    }),
    admin()
  ],
});
