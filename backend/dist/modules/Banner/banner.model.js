import { model, Schema } from "mongoose";
import { createBannerSchema, updateBannerSchema, } from "./banner.schema.js";
const BannerSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
    },
    subtitle: {
        type: String,
    },
    image: {
        type: {
            publicId: String,
            url: String,
        },
        required: [true, "Image is required"],
    },
    linkType: {
        type: String,
        enum: ["category", "product", "external", "none"],
        required: [true, "Link Type is required"],
        default: "none",
    },
    linkValue: {
        type: String,
    },
    position: {
        type: String,
        enum: ["hero_home", "hero_category", "hero_product"],
        default: "hero_home",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    priority: {
        type: Number,
        required: [true, "Priority is required"],
        default: 1,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
}, { timestamps: true });
const Banner = model("Banner", BannerSchema);
const validateCreateBanner = (banner) => {
    return createBannerSchema.safeParse(banner);
};
const validateUpdateBanner = (banner) => {
    return updateBannerSchema.safeParse(banner);
};
export { Banner, validateCreateBanner, validateUpdateBanner };
//# sourceMappingURL=banner.model.js.map