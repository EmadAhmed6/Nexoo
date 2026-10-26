import asyncHandler from "express-async-handler";
import fs from "fs";
import { sendError, successMsg } from "../../../middlewares/errors.js";
import cloudinary from "../../../config/cloudinary.js";
import { Banner, validateCreateBanner, validateUpdateBanner, } from "../../Banner/banner.model.js";
// GET ALL BANNERS
const getAllBanners = asyncHandler(async (req, res) => {
    const { position, isActive, search, page, limit } = req.query;
    const currentPage = Number(page) || 1;
    const limitPage = Number(limit) || 10;
    const filter = {};
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
    successMsg(res, 200, "Banners fetched successfully", banners);
});
// GET BANNER BY ID
const getBannerById = asyncHandler(async (req, res) => {
    const bannerId = req.params.bannerId;
    const banner = await Banner.findById(bannerId);
    if (!banner) {
        sendError(res, 404, "Banner not found");
        return;
    }
    successMsg(res, 200, "Banner fetched successfully", banner);
});
// CREATE BANNER
const createBanner = asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) {
        sendError(res, 400, "Banner image file is required");
        return;
    }
    const { success, error, data } = validateCreateBanner(req.body);
    if (!success) {
        if (file.path && fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
            }
            catch {
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
            }
            catch {
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
        successMsg(res, 201, "Banner created successfully", finalBanner);
    }
    catch (err) {
        if (file.path && fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
            }
            catch { }
        }
        sendError(res, 500, err?.message || "Failed to upload banner image");
    }
});
// UPDATE BANNER
const updateBanner = asyncHandler(async (req, res) => {
    const bannerId = req.params.bannerId;
    const banner = await Banner.findById(bannerId);
    if (!banner) {
        sendError(res, 404, "Banner not found");
        return;
    }
    const file = req.file;
    const { success, error, data } = validateUpdateBanner(req.body);
    if (!success) {
        if (file?.path && fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
            }
            catch {
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
                }
                catch {
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
                }
                catch {
                    console.error("Failed to delete banner image");
                }
            }
            banner.image = {
                publicId: result.public_id,
                url: result.secure_url,
            };
        }
        if (data.title !== undefined)
            banner.title = data.title;
        if (data.subtitle !== undefined)
            banner.subtitle = data.subtitle;
        if (data.linkType !== undefined)
            banner.linkType = data.linkType;
        if (data.linkValue !== undefined)
            banner.linkValue = data.linkValue;
        if (data.position !== undefined)
            banner.position = data.position;
        if (data.isActive !== undefined)
            banner.isActive = data.isActive;
        if (data.priority !== undefined)
            banner.priority = data.priority;
        if (data.startDate !== undefined)
            banner.startDate = data.startDate;
        if (data.endDate !== undefined)
            banner.endDate = data.endDate;
        const updatedBanner = await banner.save();
        successMsg(res, 200, "Banner updated successfully", updatedBanner);
    }
    catch (err) {
        if (file?.path && fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
            }
            catch {
                console.log("Failed to delete banner image");
            }
        }
        sendError(res, 500, err?.message || "Failed to update banner");
    }
});
// DELETE BANNER
const deleteBanner = asyncHandler(async (req, res) => {
    const bannerId = req.params.bannerId;
    const banner = await Banner.findById(bannerId);
    if (!banner) {
        sendError(res, 404, "Banner not found");
        return;
    }
    if (banner.image?.publicId) {
        try {
            await cloudinary.uploader.destroy(banner.image.publicId);
        }
        catch {
            console.error("Failed to delete banner image");
        }
    }
    await banner.deleteOne();
    successMsg(res, 200, "Banner deleted successfully", null);
});
// GET BANNER OVERVIEW
const getBannerOverview = asyncHandler(async (req, res) => {
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
    successMsg(res, 200, "Banner overview fetched successfully", {
        activeBanners,
        totalBanners,
        inactiveBanners,
        heroHomeBanners,
        heroCategoryBanners,
        heroProductBanners,
    });
});
export { getAllBanners, getBannerById, createBanner, updateBanner, deleteBanner, getBannerOverview, };
//# sourceMappingURL=adminBanner.controller.js.map