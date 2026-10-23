import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { sendError, successMsg } from "../../../middlewares/errors.js";
import { User } from "../../Users/user.model.js";

// BAN USER
const banUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    const { banDuration } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 404, "User was not found");
      return;
    }

    if (user.role === "SuperAdmin") {
      sendError(res, 403, "Cannot ban a SuperAdmin");
      return;
    }

    if (!banDuration || Number(banDuration) <= 0) {
      sendError(res, 400, "Please enter a valid ban duration in days");
      return;
    }

    const banExpires = new Date();
    banExpires.setDate(banExpires.getDate() + Number(banDuration));

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isBanned: true, banExpires },
      { new: true },
    ).select("-password");

    successMsg(res, 200, "User banned successfully", updatedUser);
  },
);

// UNBAN USER
const unbanUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 404, "User was not found");
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isBanned: false, banExpires: null },
      { new: true },
    ).select("-password");

    successMsg(res, 200, "User unbanned successfully", updatedUser);
  },
);

export { banUser, unbanUser };
