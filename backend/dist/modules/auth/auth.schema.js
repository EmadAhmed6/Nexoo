import { z } from "zod";
export const passwordSchema = z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must be at most 72 characters")
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must include uppercase, lowercase, and numbers");
const RegisterSchema = z.object({
    username: z
        .string()
        .min(3)
        .max(50)
        .regex(/^[a-zA-Z0-9_]+$/, "Username must contain only letters, numbers, and underscores"),
    fullName: z
        .string()
        .min(4, "Full Name must be 4 characters at least")
        .max(100, "Full Name must be at most 100 characters")
        .trim(),
    email: z.string().email("Invalid email address").trim(),
    password: passwordSchema,
});
const LoginSchema = z.object({
    username: z
        .string()
        .min(3)
        .max(50)
        .regex(/^[a-zA-Z0-9_]+$/, "Username must contain only letters, numbers, and underscores"),
    email: z.string().email("Invalid email address").trim(),
    password: passwordSchema,
});
export { RegisterSchema, LoginSchema };
//# sourceMappingURL=auth.schema.js.map