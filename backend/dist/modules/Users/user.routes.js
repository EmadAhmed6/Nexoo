import express from "express";
import { deleteUser, GetUserById, getUsers, updateUser, getUserAddress, addUserAddress, updateUserAddress, deleteUserAddress, } from "./user.controller.js";
import { verifyToken, verifyAuthorizedToken, verifyAdminToken, } from "../../middlewares/verifyToken.js";
const router = express.Router();
router.route("/").get(verifyAdminToken, getUsers);
router
    .route("/:userId")
    .get(verifyToken, GetUserById)
    .put(verifyAuthorizedToken, updateUser)
    .delete(verifyAuthorizedToken, deleteUser);
router
    .route("/:userId/addresses")
    .post(verifyAuthorizedToken, addUserAddress)
    .get(verifyToken, getUserAddress);
router
    .route("/:userId/addresses/:addressId")
    .put(verifyAuthorizedToken, updateUserAddress)
    .delete(verifyAuthorizedToken, deleteUserAddress);
export default router;
//# sourceMappingURL=user.routes.js.map