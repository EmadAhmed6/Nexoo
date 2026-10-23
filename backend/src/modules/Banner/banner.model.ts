import { Document, model, Schema } from "mongoose";
import {
  createBannerSchema,
  updateBannerSchema,
} from "./banner.schema.js";

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  image: {
    publicId: string;
    url: string;
  };
  linkType: "category" | "product" | "external" | "none";
  linkValue?: string;
  position: "hero_home" | "hero_category" | "hero_product";
  isActive: boolean;
  priority: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
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
  },
  { timestamps: true },
);

const Banner = model<IBanner>("Banner", BannerSchema);

const validateCreateBanner = (banner: IBanner) => {
  return createBannerSchema.safeParse(banner);
};

const validateUpdateBanner = (banner: IBanner) => {
  return updateBannerSchema.safeParse(banner);
};

export { Banner, validateCreateBanner, validateUpdateBanner };
