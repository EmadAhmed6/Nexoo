import asyncHandler from "express-async-handler";
import { sendError, successMsg } from "../../../middlewares/errors.js";
import { User } from "../../Users/user.model.js";
// BAN USER
const banUser = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const currentUser = req.user;
    const { banDuration } = req.body;
    const user = await User.findById(userId);
    if (!userId) {
        sendError(res, 400, "User ID is required");
        return;
    }
    if (currentUser?.id?.toString() === userId?.toString()) {
        sendError(res, 400, "You cannot ban yourself");
        return;
    }
    if (!user) {
        sendError(res, 404, "User was not found");
        return;
    }
    if (user.role === "SuperAdmin") {
        sendError(res, 403, "Access denied: Cannot ban a SuperAdmin");
        return;
    }
    if (user.role === "Admin" && currentUser?.role !== "SuperAdmin") {
        sendError(res, 403, "Access denied: Only SuperAdmin can manage other Admins");
        return;
    }
    const durationNumber = Number(banDuration);
    if (!banDuration || isNaN(durationNumber) || durationNumber <= 0) {
        sendError(res, 400, "Please enter a valid ban duration in days");
        return;
    }
    const banExpires = new Date();
    banExpires.setDate(banExpires.getDate() + durationNumber);
    const updatedUser = await User.findByIdAndUpdate(userId, { isBanned: true, banExpires }, { new: true }).select("-password");
    successMsg(res, 200, "User banned successfully", updatedUser);
});
// UNBAN USER
const unbanUser = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    const currentUser = req.user;
    if (!user) {
        sendError(res, 404, "User was not found");
        return;
    }
    if (user.role === "SuperAdmin" && currentUser?.role !== "SuperAdmin") {
        sendError(res, 403, "Access denied: Cannot unban a SuperAdmin");
        return;
    }
    if (user.role === "Admin" && currentUser?.role !== "SuperAdmin") {
        sendError(res, 403, "Access denied: Only SuperAdmin can manage other Admins");
        return;
    }
    const updatedUser = await User.findByIdAndUpdate(userId, { isBanned: false, banExpires: null }, { new: true }).select("-password");
    successMsg(res, 200, "User unbanned successfully", updatedUser);
});
// SET USER AS ADMIN
const toggleAdminStatus = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    const currentUser = req.user;
    if (!user) {
        sendError(res, 404, "User was not found");
        return;
    }
    if (currentUser?._id?.toString() === userId?.toString()) {
        sendError(res, 400, "Access denied: You cannot change your own role status");
        return;
    }
    if (user.role === "SuperAdmin") {
        sendError(res, 403, "Access denied: Cannot modify SuperAdmin role");
        return;
    }
    if (currentUser.role !== "SuperAdmin") {
        sendError(res, 403, "Access denied: Only SuperAdmin can manage Admin roles");
        return;
    }
    const newRole = user.role === "Admin" ? "User" : "Admin";
    const updatedUser = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true }).select("-password");
    successMsg(res, 200, `User is now ${newRole}`, updatedUser);
});
export { banUser, unbanUser, toggleAdminStatus };
//# sourceMappingURL=adminUsers.controller.js.map