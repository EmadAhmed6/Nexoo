import express from "express";
import {
  banUser,
  unbanUser,
  toggleAdminStatus,
} from "./adminUsers.controller.js";
import {
  verifyAdminToken,
  verifySuperAdminToken,
} from "../../../middlewares/verifyToken.js";

const router = express.Router();

router
  .route("/:userId/ban")
  .put(verifyAdminToken, banUser)
  .patch(verifyAdminToken, banUser);

router
  .route("/:userId/unban")
  .put(verifyAdminToken, unbanUser)
  .patch(verifyAdminToken, unbanUser);

router
  .route("/:userId/toggle-admin")
  .patch(verifySuperAdminToken, toggleAdminStatus);

export default router;
