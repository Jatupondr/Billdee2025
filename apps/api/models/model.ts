import { status } from "elysia";
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, required: true },
    image: { type: String },
    // createdAt: { type: Date, required: true },
    // updatedAt: { type: Date, required: true },
  },
  { collection: "user", timestamps: true }
);

const sessionSchema = new Schema(
  {
    _id: { type: String },
    expiresAt: { type: Date, required: true },
    token: { type: String, required: true, unique: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    userId: { type: String, ref: "User", required: true },
    activeOrganizationId: { type: String, ref: "Organization" },
  },
  { collection: "session" }
);

const accountSchema = new Schema(
  {
    _id: { type: String },
    accountId: { type: String, required: true },
    providerId: { type: String, required: true },
    userId: { type: String, ref: "User", required: true },
    accessToken: { type: String },
    refreshToken: { type: String },
    idToken: { type: String },
    accessTokenExpiresAt: { type: Date },
    refreshTokenExpiresAt: { type: Date },
    scope: { type: String },
    password: { type: String },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { collection: "account" }
);

const verificationSchema = new Schema(
  {
    _id: { type: String },
    identifier: { type: String, required: true },
    value: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "verification" }
);

const OrganizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    logo: {
      type: String,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed, // รองรับ object / json ได้
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    taxId: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    note: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    province: {
      type: String,
      default: null,
    },
    district: {
      type: String,
      default: null,
    },
    subDistrict: {
      type: String,
      default: null,
    },
    postalCode: {
      type: String,
      default: null,
    },
    account_no: {
      type: String,
      default: null,
    },
    account_name: {
      type: String,
      default: null,
    },
    prompt_pay: {
      type: String,
      default: null,
    },
    bank_name: {
      type: String,
      default: null,
    },
  },

  {
    collection: "organization",
    timestamps: true,
  }
);

const memberSchema = new Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "member"],
      default: "member",
    },
  },
  {
    collection: "member",
    timestamps: true,
  }
);
const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    cost: {
      type: Number,
      default: 0,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isRecommended: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "product",
    timestamps: true,
  }
);

const customerSchemaq = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    address: {
      type: String,
    },

    province: {
      type: String,
    },
    district: {
      type: String,
    },
    subDistrict: {
      type: String,
    },
    postalCode: {
      type: String,
    },

    phone: {
      type: String,
    },

    typeCustomer: {
      type: String,
      enum: ["customer", "supplier"],
      default: "customer",
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "customer",
    timestamps: true,
  }
);

const billSchemaq = new Schema(
  {
    billNumber: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    name_customer: {
      type: String,
      required: true,
    },
    phone_customer: {
      type: String,
    },
    address_customer: {
      type: String,
    },
    products: [
      {
        no: {
          type: Number,
        },
        productId: {
          type: String,
          ref: "Product",
        },
        name: {
          type: String,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        cost: {
          type: Number,
          default: 0,
        },
        price: {
          type: Number,
        },
        note: {
          type: String,
        },

        total: {
          type: Number,
          required: true,
        },
      },
    ],
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    includeVat: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      default: 0,
    },
    taxPercent: {
      type: Number,
      default: 0,
    },
    cost: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    vat: {
      type: Number,
      default: 0,
    },
    note: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "canceled"],
      default: "pending",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "bill",
    timestamps: true,
  }
);


const billTemplateSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },

    footerText: {
      type: String,
      default: null,
    },
    footerSubText: {
      type: String,
      default: null,
    },
    themcolor: {
      type: String,
      default: null,
    },
    fontSize: {
      type: Number,
      default: 14,
    },
    typePage: {
      type: String,

      default: "A4",
    },
    pageOrientation: {
      type: String,
      enum: ["portrait", "landscape"],
      default: "portrait",
    },
    pageMargins: {
      type: Object,
      default: {
        top: 60,
        right: 60,
        bottom: 60,
        left: 60,
      },
    },
    organizationId: {
      type: String,
      ref: "Organization",
      required: true,
    },
  },
  {
    collection: "billTemplate",
    timestamps: true,
  }

);


const affiliateSchema = new Schema(
  {

    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    referalCode: {
      type: String,
      required: true,
    },
    referalLink: {
      type: String,
      required: true,
    },


    isDeleted: {
      type: Boolean,
      default: false,
    },
  },

  {
  collection: "affiliate",
  timestamps: true,
  }
);

const User = model("User", userSchema);
const Session = model("Session", sessionSchema);
const Account = model("Account", accountSchema);
const Verification = model("Verification", verificationSchema);
const Organization = model("Organization", OrganizationSchema);
const Member = model("Member", memberSchema);
const Product = model("Product", productSchema);
const Customer = model("Customer", customerSchemaq);
const Bill = model("Bill", billSchemaq);
const BillTemplate = model("BillTemplate", billTemplateSchema);
const Affiliate = model("Affiliate", affiliateSchema);
export {
  User,
  Session,
  Account,
  Verification,
  Organization,
  Member,
  Product,
  Customer,
  Bill,
  BillTemplate,
  Affiliate,
};
