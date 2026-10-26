import { z } from "zod";
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must include uppercase, lowercase, and numbers",
  );

const RegisterSchema = z.object({
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
  password: passwordSchema,
  phone: z.string().length(11, "Phone number must be 11 digits"),
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email address").trim(),
  password: passwordSchema,
});

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").trim(),
});

const ResetPasswordSchema = z.object({
  email: z.string().email("Invalid email address").trim(),
  newPassword: passwordSchema,
  token: z.string().min(1, "Token is required"),
});

export type IRegisterSchema = z.infer<typeof RegisterSchema>;
export type ILoginSchema = z.infer<typeof LoginSchema>;
export type IForgotPasswordSchema = z.infer<typeof ForgotPasswordSchema>;
export type IResetPasswordSchema = z.infer<typeof ResetPasswordSchema>;

export {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
};
