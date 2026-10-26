import { z } from "zod";
const createBannerSchema = z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().optional(),
    linkType: z.enum(["category", "product", "external", "none"]).default("none"),
    linkValue: z.string().optional(),
    isActive: z
        .union([z.boolean(), z.string()])
        .transform((val) => val === true || val === "true" || val === "1")
        .default(true),
    priority: z.coerce.number().min(0, "Priority must be at least 0").default(1),
    startDate: z
        .string()
        .optional()
        .transform((val) => (val && val.trim() !== "" ? new Date(val) : undefined)),
    endDate: z
        .string()
        .optional()
        .transform((val) => (val && val.trim() !== "" ? new Date(val) : undefined)),
    position: z
        .enum(["hero_home", "hero_category", "hero_product"])
        .default("hero_home"),
    image: z
        .object({
        publicId: z.string(),
        url: z.string(),
    })
        .optional(),
});
const updateBannerSchema = z.object({
    title: z.string().min(1).optional(),
    subtitle: z.string().optional(),
    linkType: z.enum(["category", "product", "external", "none"]).optional(),
    linkValue: z.string().optional(),
    isActive: z
        .union([z.boolean(), z.string()])
        .transform((val) => val === true || val === "true" || val === "1")
        .optional(),
    priority: z.coerce.number().min(0).optional(),
    startDate: z
        .string()
        .optional()
        .transform((val) => (val && val.trim() !== "" ? new Date(val) : undefined)),
    endDate: z
        .string()
        .optional()
        .transform((val) => (val && val.trim() !== "" ? new Date(val) : undefined)),
    position: z
        .enum(["hero_home", "hero_category", "hero_product"])
        .optional(),
    image: z
        .object({
        publicId: z.string(),
        url: z.string(),
    })
        .optional(),
});
export { createBannerSchema, updateBannerSchema };
//# sourceMappingURL=banner.schema.js.map