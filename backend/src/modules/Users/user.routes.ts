import express from "express";
import {
  deleteUser,
  GetUserById,
  getUsers,
  updateUser,
} from "./user.controller.js";
import {
  verifyToken,
  verifyAuthorizedToken,
  verifyAdminToken,
} from "../../middlewares/verifyToken.js";
const router = express.Router();

router.route("/").get(verifyAdminToken, getUsers);
router
  .route("/:userId")
  .get(verifyToken, GetUserById)
  .put(verifyAuthorizedToken, updateUser)
  .delete(verifyAuthorizedToken, deleteUser);
export default router;
