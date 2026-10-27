import { Document, model, Schema, Types } from "mongoose";
import {
  ChangePasswordSchema,
  CreateAddressSchema,
  IChangePasswordSchema,
  ICreateAddressSchema,
  IResendOtpSchema,
  IUpdateAdressSchema,
  IUserSchema,
  IVerifyOtpSchema,
  ResendOtpSchema,
  UpdateAdressSchema,
  VerifyOtpSchema,
} from "./user.schema.js";
import jwt from "jsonwebtoken";

import {
  ForgotPasswordSchema,
  IForgotPasswordSchema,
  ILoginSchema,
  IRegisterSchema,
  IResetPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
} from "../Auth/auth.schema.js";

interface IAddress extends Document {
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  phone: string;
  isDefault: boolean;
}

export interface IUser extends IUserSchema, Document {
  generateAccessToken(): string;
  generateRefreshToken(): string;
  addresses: Types.DocumentArray<IAddress>;
  phone: string;
  provider: "local" | "google";
  role: "User" | "Admin" | "SuperAdmin";

  isVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  banExpires?: Date;
  refreshToken: string | undefined;
  profilePicture: {
    publicId: string;
    url: string;
  } | null;
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
    isBanned: {
      type: Boolean,
      default: false,
    },
    banExpires: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpired: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true },
);

UserSchema.methods.generateAccessToken = function (this: IUser): string {
  return jwt.sign(
    {
      id: this._id,
      userId: this._id,
      role: this.role,
      username: this.username,
    },
    process.env.JWT_SECRET_KEY as string,
    {
      expiresIn: "15m",
    },
  );
};

UserSchema.methods.generateToken = UserSchema.methods.generateAccessToken;

UserSchema.methods.generateRefreshToken = function (this: IUser): string {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET_KEY as string,
    { expiresIn: "30d" },
  );
};

export const User = model<IUser>("User", UserSchema);

const validateRegister = (user: IRegisterSchema) => {
  return RegisterSchema.safeParse(user);
};

const validateLogin = (user: ILoginSchema) => {
  return LoginSchema.safeParse(user);
};

const validateCreateAddress = (address: ICreateAddressSchema) => {
  return CreateAddressSchema.safeParse(address);
};

const validateUpdateAddress = (address: IUpdateAdressSchema) => {
  return UpdateAdressSchema.safeParse(address);
};

const validateForgotPassword = (user: IForgotPasswordSchema) => {
  return ForgotPasswordSchema.safeParse(user);
};

const validateResetPassword = (user: IResetPasswordSchema) => {
  return ResetPasswordSchema.safeParse(user);
};

const validateVerifyOtp = (user: IVerifyOtpSchema) => {
  return VerifyOtpSchema.safeParse(user);
};

const validateChangePassword = (password: IChangePasswordSchema) => {
  return ChangePasswordSchema.safeParse(password);
};

const validateResendOtp = (data: IResendOtpSchema) => {
  return ResendOtpSchema.safeParse(data);
};

export {
  validateRegister,
  validateLogin,
  validateCreateAddress,
  validateUpdateAddress,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyOtp,
  validateChangePassword,
  validateResendOtp,
};
