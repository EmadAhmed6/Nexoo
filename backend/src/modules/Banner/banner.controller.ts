import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { successMsg } from "../../middlewares/errors.js";
import { Banner } from "./banner.model.js";

// ACTIVE BANNERS
const getActiveBanners = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { position = "hero_home" } = req.query;
    const currentDate = new Date();

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

    successMsg(res, 200, "Active banners fetched successfully", banners);
  },
);

export { getActiveBanners };
