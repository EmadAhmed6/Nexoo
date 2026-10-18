import { Document, model, Schema } from "mongoose";
import { IUserSchema } from "./user.schema.js";
import jwt from "jsonwebtoken";

import {
  ILoginSchema,
  IRegisterSchema,
  LoginSchema,
  RegisterSchema,
} from "../Auth/auth.schema.js";

interface IAddress extends Document {
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  phone: string;
  isDefault: boolean;
}

interface IUser extends IUserSchema, Document {
  generateAccessToken(): string;
  addresses: IAddress[];
  phone: string;
  provider: "local" | "google";
  role: "User" | "Admin" | "SuperAdmin";
  profilePicture: {
    url: string;
    publicId: string | null;
  };
  isVerified: boolean;
  isActive: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      minLength: 4,
      unique: true,
    },
    fullName: {
      type: String,
      minLength: 4,
      maxLength: 100,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    addresses: [
      {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String },
        phone: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePicture: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: null,
      },
    },
    role: {
      type: String,
      enum: ["User", "Admin", "SuperAdmin"],
      default: "User",
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

UserSchema.methods.generateAccessToken = function (this: IUser): string {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      username: this.username,
    },
    process.env.JWT_SECRET_KEY as string,
    {
      expiresIn: "7d",
    },
  );
};

export const User = model<IUser>("User", UserSchema);

const validateRegister = (user: IRegisterSchema) => {
  return RegisterSchema.safeParse(user);
};

const validateLogin = (user: ILoginSchema) => {
  return LoginSchema.safeParse(user);
};

export { validateRegister, validateLogin };
