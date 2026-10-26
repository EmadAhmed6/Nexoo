import { z } from "zod";
import { passwordSchema, } from "../Auth/auth.schema.js";
const UserSchema = z.object({
    username: z
        .string()
        .min(3)
        .max(50)
        .trim()
        .regex(/^[a-zA-Z0-9_]+$/, "Username must contain only letters, numbers, and underscores"),
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
    postalCode: z.preprocess((val) => val === null || (typeof val === "string" && val.trim() === "")
        ? undefined
        : val, z.string().min(3).max(100).trim().optional()),
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
export { UserSchema, CreateAddressSchema, UpdateAdressSchema, VerifyOtpSchema, ResendOtpSchema, ChangePasswordSchema, };
//# sourceMappingURL=user.schema.js.map