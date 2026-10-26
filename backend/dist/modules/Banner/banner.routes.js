import express from "express";
import { getActiveBanners } from "./banner.controller.js";
const router = express.Router();
router.get("/", getActiveBanners);
export default router;
//# sourceMappingURL=banner.routes.js.map