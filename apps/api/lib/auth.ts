import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "./db";
import {
  haveIBeenPwned,
  lastLoginMethod,
  multiSession,
  openAPI,
  organization,
  admin as adminPlugin,
} from "better-auth/plugins";
import { ac, admin, user } from "./permissions";
import OTPEmail from "../src/email/reset-password";
import { sendEmailResetPassword } from "../src/email/emil";

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
    delete: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 20,
    sendResetPassword: async ({ user, url, token }, request) => {

      await sendEmailResetPassword(user.email, 'Reset Password', url);
    },
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
    adminPlugin({
      defaultRole: "user",
      adminRoles: ["admin"],
      bannedUserMessage: "คุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
      ac,
      defaultBanReason: "Spamming",
      defaultBanExpiresIn: 60 * 60 * 24, // 1 day
      roles: {
        admin,
        user,
      },
    }),
  ],
});
