import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import fs from "fs";
import { sendError, successMsg } from "../../../middlewares/errors.js";
import cloudinary from "../../../config/cloudinary.js";
import {
  Banner,
  validateCreateBanner,
  validateUpdateBanner,
} from "../../Banner/banner.model.js";
import { redis } from "../../../config/redis.js";

// GET ALL BANNERS
const getAllBanners = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { position, isActive, search, page, limit } = req.query;
    const currentPage = Number(page) || 1;
    const limitPage = Number(limit) || 10;
    const filter: Record<string, any> = {};
    const cacheKey = `admin:banners:${position}`;

    const cachedBanners = await redis.get(cacheKey);
    if (cachedBanners) {
      successMsg(
        res,
        200,
        "Banners fetched successfully",
        JSON.parse(cachedBanners),
        "cache",
      );
      return;
    }

    if (position && typeof position === "string" && position !== "all") {
      filter.position = position;
    }

    if (isActive && typeof isActive === "string") {
      filter.isActive = isActive === "true" ? true : false;
    }

    if (search && typeof search === "string" && search.trim() !== "") {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { subtitle: { $regex: search, $options: "i" } },
      ];
    }

    const banners = await Banner.find(filter)
      .sort({
        priority: -1,
        createdAt: -1,
      })
      .skip((currentPage - 1) * limitPage)
      .limit(limitPage);

    await redis.set(cacheKey, JSON.stringify(banners), { EX: 600 });
    successMsg(res, 200, "Banners fetched successfully", banners);
  },
);

// GET BANNER BY ID
const getBannerById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const bannerId = req.params.bannerId;
    const banner = await Banner.findById(bannerId);
    const cacheKey = `banner:${bannerId}`;

    const cachedBanner = await redis.get(cacheKey);
    if (cachedBanner) {
      successMsg(
        res,
        200,
        "Banner fetched successfully",
        JSON.parse(cachedBanner),
        "cache",
      );
      return;
    }

    if (!banner) {
      sendError(res, 404, "Banner not found");
      return;
    }
    await redis.set(cacheKey, JSON.stringify(banner), { EX: 600 });
    successMsg(res, 200, "Banner fetched successfully", banner);
  },
);

// CREATE BANNER
const createBanner = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const file = req.file as Express.Multer.File;
    if (!file) {
      sendError(res, 400, "Banner image file is required");
      return;
    }

    const { success, error, data } = validateCreateBanner(req.body);
    if (!success) {
      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch {
          console.error("Failed to delete banner image");
        }
      }
      sendError(res, 400, error.issues[0]?.message || "Invalid Inputs");
      return;
    }

    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "Banners",
        resource_type: "auto",
      });

      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch {
          console.error("Failed to delete banner image");
        }
      }

      const banner = new Banner({
        title: data.title,
        subtitle: data.subtitle,
        linkType: data.linkType,
        linkValue: data.linkValue,
        position: data.position,
        isActive: data.isActive,
        priority: data.priority,
        startDate: data.startDate,
        endDate: data.endDate,
        image: {
          publicId: result.public_id,
          url: result.secure_url,
        },
      });

      const finalBanner = await banner.save();
      await redis.del(`banners:${finalBanner.position}`);
      successMsg(res, 201, "Banner created successfully", finalBanner);
    } catch (err: any) {
      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch {}
      }
      sendError(res, 500, err?.message || "Failed to upload banner image");
    }
  },
);

// UPDATE BANNER
const updateBanner = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const bannerId = req.params.bannerId;
    const banner = await Banner.findById(bannerId);
    if (!banner) {
      sendError(res, 404, "Banner not found");
      return;
    }

    const file = req.file as Express.Multer.File;
    const { success, error, data } = validateUpdateBanner(req.body);
    if (!success) {
      if (file?.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch {
          console.error("Failed to delete banner image");
        }
      }
      sendError(res, 400, error.issues[0]?.message || "Invalid Inputs");
      return;
    }

    try {
      if (file) {
        if (banner.image?.publicId) {
          try {
            await cloudinary.uploader.destroy(banner.image.publicId);
          } catch {
            console.error("Failed to delete banner image");
          }
        }

        const result = await cloudinary.uploader.upload(file.path, {
          folder: "Banners",
          resource_type: "auto",
        });

        if (file.path && fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch {
            console.error("Failed to delete banner image");
          }
        }

        banner.image = {
          publicId: result.public_id,
          url: result.secure_url,
        };
      }

      if (data.title !== undefined) banner.title = data.title;
      if (data.subtitle !== undefined) banner.subtitle = data.subtitle;
      if (data.linkType !== undefined) banner.linkType = data.linkType;
      if (data.linkValue !== undefined) banner.linkValue = data.linkValue;
      if (data.position !== undefined) banner.position = data.position;
      if (data.isActive !== undefined) banner.isActive = data.isActive;
      if (data.priority !== undefined) banner.priority = data.priority;
      if (data.startDate !== undefined) banner.startDate = data.startDate;
      if (data.endDate !== undefined) banner.endDate = data.endDate;

      const updatedBanner = await banner.save();
      await redis.del(`admin:banners:${data.position}`);
      successMsg(res, 200, "Banner updated successfully", updatedBanner);
    } catch (err: any) {
      if (file?.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch {
          console.log("Failed to delete banner image");
        }
      }
      sendError(res, 500, err?.message || "Failed to update banner");
    }
  },
);

// DELETE BANNER
const deleteBanner = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const bannerId = req.params.bannerId;
    const banner = await Banner.findById(bannerId);
    if (!banner) {
      sendError(res, 404, "Banner not found");
      return;
    }

    if (banner.image?.publicId) {
      try {
        await cloudinary.uploader.destroy(banner.image.publicId);
      } catch {
        console.error("Failed to delete banner image");
      }
    }

    await banner.deleteOne();
    await redis.del(`admin:banners:${banner.position}`);
    successMsg(res, 200, "Banner deleted successfully", null);
  },
);

// GET BANNER OVERVIEW
const getBannerOverview = asyncHandler(async (req: Request, res: Response) => {
  const cacheKey = "admin:banners:overview";
  const cachedOverview = await redis.get(cacheKey);
  if (cachedOverview) {
    successMsg(
      res,
      200,
      "Banner overview fetched successfully",
      JSON.parse(cachedOverview),
      "cache",
    );
    return;
  }
  const activeBanners = await Banner.countDocuments({ isActive: true });
  const totalBanners = await Banner.countDocuments();
  const inactiveBanners = totalBanners - activeBanners;
  const heroHomeBanners = await Banner.countDocuments({
    position: "hero_home",
  });
  const heroCategoryBanners = await Banner.countDocuments({
    position: "hero_category",
  });
  const heroProductBanners = await Banner.countDocuments({
    position: "hero_product",
  });
  const overviewResponse = {
    activeBanners,
    totalBanners,
    inactiveBanners,
    heroHomeBanners,
    heroCategoryBanners,
    heroProductBanners,
  };
  await redis.set(cacheKey, JSON.stringify(overviewResponse), { EX: 600 });
  successMsg(
    res,
    200,
    "Banner overview fetched successfully",
    overviewResponse,
  );
});

export {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  getBannerOverview,
};
