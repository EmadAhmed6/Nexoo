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
    password: passwordSchema,
});
//# sourceMappingURL=user.schema.js.map