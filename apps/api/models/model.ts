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
  },
  {
    collection: "product",
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

export { User, Session, Account, Verification, Organization, Member, Product };
