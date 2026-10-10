import { z } from "zod";
import { passwordSchema, } from "../auth/auth.schema.js";
const UserSchema = z.object({
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
    role: z.enum(["User", "Admin", "SuperAdmin"]).default("User"),
    provider: z.enum(["local", "google"]).default("local"),
    profilePicture: z
        .object({
        url: z.string().optional(),
        publicId: z.string().optional(),
    })
        .optional(),
    isVerified: z.boolean().default(false),
});
//# sourceMappingURL=user.schema.js.map