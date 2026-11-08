import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { successMsg } from "../../middlewares/errors.js";
import { Banner } from "./banner.model.js";
import { redis } from "../../config/redis.js";

// ACTIVE BANNERS
const getActiveBanners = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { position = "hero_home" } = req.query;
    const currentDate = new Date();
    const cacheKey = `banners:${position}`;

    const cachedBanners = await redis.get(cacheKey);
    if (cachedBanners) {
      successMsg(
        res,
        200,
        "Active banners fetched successfully",
        JSON.parse(cachedBanners),
      );
      return;
    }
    const query: Record<string, any> = {
      isActive: true,
      $and: [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: null },
            { startDate: { $lte: currentDate } },
          ],
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: currentDate } },
          ],
        },
      ],
    };

    if (position && position !== "all") {
      query.position = position;
    }

    const banners = await Banner.find(query).sort({
      priority: -1,
      createdAt: -1,
    });

    await redis.set(cacheKey, JSON.stringify(banners), { EX: 600 });
    successMsg(res, 200, "Active banners fetched successfully", banners);
  },
);

export { getActiveBanners };
