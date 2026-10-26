import { z } from "zod";
import {
  ILoginSchema,
  IRegisterSchema,
  LoginSchema,
  passwordSchema,
  RegisterSchema,
} from "../Auth/auth.schema.js";

const UserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(50)
    .trim()
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username must contain only letters, numbers, and underscores",
    ),
  fullName: z
    .string()
    .min(4, "Full Name must be 4 characters at least")
    .max(100, "Full Name must be at most 100 characters")
    .trim(),
  email: z.string().email("Invalid email address").trim(),
  phone: z.string().length(11).trim(),
  otp: z.string().length(6).optional(),
  otpExpired: z.date().optional(),
  password: passwordSchema,
});

const ChangePasswordSchema = z.object({
  oldPassword: passwordSchema,
  newPassword: passwordSchema,
});

const CreateAddressSchema = z.object({
  street: z.string().min(3).max(100).trim(),
  city: z.string().min(3).max(100).trim(),
  state: z.string().min(3).max(100).trim(),
  postalCode: z.preprocess(
    (val) =>
      val === null || (typeof val === "string" && val.trim() === "")
        ? undefined
        : val,
    z.string().min(3).max(100).trim().optional(),
  ),
  phone: z.string().min(11).max(11).trim(),
  isDefault: z.boolean().default(false),
});

const VerifyOtpSchema = z.object({
  otp: z.string().length(6),
  email: z.string().email(),
});

const ResendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const UpdateAdressSchema = CreateAddressSchema.partial();

export type IUserSchema = z.infer<typeof UserSchema>;
export type ICreateAddressSchema = z.infer<typeof CreateAddressSchema>;
export type IUpdateAdressSchema = z.infer<typeof UpdateAdressSchema>;
export type IVerifyOtpSchema = z.infer<typeof VerifyOtpSchema>;
export type IResendOtpSchema = z.infer<typeof ResendOtpSchema>;
export type IChangePasswordSchema = z.infer<typeof ChangePasswordSchema>;

export {
  UserSchema,
  CreateAddressSchema,
  UpdateAdressSchema,
  VerifyOtpSchema,
  ResendOtpSchema,
  ChangePasswordSchema,
};
