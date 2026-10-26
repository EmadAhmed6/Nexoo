import express from "express";
import {
  deleteUser,
  GetUserById,
  getUsers,
  updateUser,
  deleteUserProfile,
  getUserAddress,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  changePassword,
} from "./user.controller.js";
import {
  verifyToken,
  verifyAuthorizedToken,
  verifyAdminToken,
} from "../../middlewares/verifyToken.js";
import upload from "../../middlewares/multer.js";

const router = express.Router();

router.route("/").get(verifyAdminToken, getUsers);

router
  .route("/:userId")
  .get(verifyToken, GetUserById)
  .put(verifyAuthorizedToken, upload.single("profilePicture"), updateUser)
  .delete(verifyAuthorizedToken, deleteUser);

// Profile picture delete
router
  .route("/:userId/profile-picture")
  .delete(verifyAuthorizedToken, deleteUserProfile);

router
  .route("/:userId/addresses")
  .post(verifyAuthorizedToken, addUserAddress)
  .get(verifyToken, getUserAddress);

router
  .route("/:userId/addresses/:addressId")
  .put(verifyAuthorizedToken, updateUserAddress)
  .delete(verifyAuthorizedToken, deleteUserAddress);

router
  .route("/:userId/change-password")
  .put(verifyAuthorizedToken, changePassword);

export default router;
