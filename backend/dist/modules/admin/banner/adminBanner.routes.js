import express from "express";
import { getAllBanners, getBannerById, createBanner, updateBanner, deleteBanner, getBannerOverview, } from "./adminBanner.controller.js";
import { verifyAdminToken } from "../../../middlewares/verifyToken.js";
import upload from "../../../middlewares/multer.js";
const router = express.Router();
router.get("/overview", verifyAdminToken, getBannerOverview);
router
    .route("/")
    .get(verifyAdminToken, getAllBanners)
    .post(verifyAdminToken, upload.single("image"), createBanner);
router
    .route("/:bannerId")
    .get(verifyAdminToken, getBannerById)
    .put(verifyAdminToken, upload.single("image"), updateBanner)
    .delete(verifyAdminToken, deleteBanner);
export default router;
//# sourceMappingURL=adminBanner.routes.js.map