import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { User } from "./user.model.js";
import { sendError, successMsg } from "../../middlewares/errors.js";
// GET ALL USERS
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password");
    if (!users) {
        sendError(res, 404, "Users not found");
        return;
    }
    successMsg(res, 200, "Users fetched successfully", users);
});
// GET SINGLE USER
const GetUserById = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
        sendError(res, 404, "User not found");
        return;
    }
    successMsg(res, 200, "User fetched successfully", user);
});
// UPDATE USER
const updateUser = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
        sendError(res, 404, "User not found");
        return;
    }
    const updateData = { ...req.body };
    if (updateData.password && updateData.password.trim().length > 0) {
        const genSalt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, genSalt);
    }
    else {
        delete updateData.password;
    }
    // Prevent non-admin users from escalating their role
    if (req.user?.role !== "SuperAdmin" && req.user?.role !== "Admin") {
        delete updateData.role;
    }
    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true }).select("-password");
    successMsg(res, 200, "User updated successfully", updatedUser);
});
// DELETE USER
const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
        sendError(res, 400, "User not found");
        return;
    }
    await user.deleteOne();
    successMsg(res, 200, "User deleted successfully", null);
});
export { getUsers, GetUserById, updateUser, deleteUser };
//# sourceMappingURL=user.controller.js.map