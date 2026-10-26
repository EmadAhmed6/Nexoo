import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  User,
  validateChangePassword,
  validateCreateAddress,
  validateUpdateAddress,
} from "./user.model.js";
import { sendError, successMsg } from "../../middlewares/errors.js";
import cloudinary from "../../config/cloudinary.js";
import fs from "fs";
import { generateVerifyOtpEmailHtml, sendEmail } from "../../config/Email.js";

// GET ALL USERS
const getUsers = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const users = await User.find().select("-password");
    if (!users) {
      sendError(res, 404, "Users not found");
      return;
    }
    successMsg(res, 200, "Users fetched successfully", users);
  },
);

// GET SINGLE USER
const GetUserById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      sendError(res, 404, "User not found");
      return;
    }
    successMsg(res, 200, "User fetched successfully", user);
  },
);

// UPDATE USER
const updateUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      sendError(res, 404, "User not found");
      return;
    }

    const updateData: Record<string, any> = { ...req.body };

    if (req.file) {
      if (user.profilePicture && user.profilePicture.publicId) {
        await cloudinary.uploader.destroy(user.profilePicture.publicId);
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "users",
        resource_type: "image",
      });

      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }

      updateData.profilePicture = {
        publicId: result.public_id,
        url: result.secure_url,
      };
    }

    if (req.user?.role !== "SuperAdmin" && req.user?.role !== "Admin") {
      delete updateData.role;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password");

    successMsg(res, 200, "User updated successfully", updatedUser);
  },
);

// DELETE USER PROFILE
const deleteUserProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      sendError(res, 404, "User not found");
      return;
    }
    if (user.profilePicture && user.profilePicture.publicId) {
      await cloudinary.uploader.destroy(user.profilePicture.publicId);
    }
    user.profilePicture = null;
    await user.save();
    successMsg(res, 200, "Profile picture deleted successfully", null);
  },
);

// DELETE USER
const deleteUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 400, "User not found");
      return;
    }
    await user.deleteOne();
    successMsg(res, 200, "User deleted successfully", null);
  },
);

const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { success, error } = validateChangePassword(req.body);
  if (!success) {
    sendError(res, 400, error.message);
    return;
  }
  const userId = req.params.userId;
  const user = await User.findById(userId);
  if (!user) {
    sendError(res, 404, "User not found");
    return;
  }
  const isPasswordMatch = await bcrypt.compare(
    req.body.oldPassword,
    user.password,
  );
  if (!isPasswordMatch) {
    sendError(res, 400, "Incorrect old password");
    return;
  }

  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpired = new Date(Date.now() + 10 * 60 * 1000);
  user.otp = generatedOtp;
  user.otpExpired = otpExpired;
  
  await sendEmail(
    user.email,
    "Password Changed - Security Code - Nexoo",
    generateVerifyOtpEmailHtml(user.username, generatedOtp),
  );
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.newPassword, salt);
  await user.save();
  successMsg(res, 200, "Password changed successfully. A security code has been sent to your email.", null);
});

// ============== USER ADDRESSES ==============

// GET USER ADDRESSES
const getUserAddress = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 404, "User not found");
      return;
    }
    successMsg(res, 200, "User addresses fetched successfully", user.addresses);
  },
);

// ADD NEW ADDRESS
const addUserAddress = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { success, error } = validateCreateAddress(req.body);
    if (!success) {
      sendError(res, 400, error.message);
      return;
    }

    const userId = req.params.userId;
    const { street, city, state, postalCode, phone, isDefault } = req.body;
    if (!userId) {
      sendError(res, 400, "User ID is required");
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 404, "User was not found");
      return;
    }

    const address = {
      street,
      city,
      state,
      postalCode,
      phone,
      isDefault,
    };

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(address as any);
    await user.save();
    successMsg(res, 200, "Address added successfully", user.addresses);
  },
);

// UPDATE USER ADDRESS
const updateUserAddress = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { success, error } = validateUpdateAddress(req.body);
    if (!success) {
      sendError(res, 400, error.message);
      return;
    }
    const userId = req.params.userId;
    const addressId = req.params.addressId as string;
    const { street, city, state, postalCode, phone, isDefault } = req.body;
    if (!userId || !addressId) {
      sendError(res, 400, "User ID and Address ID is required");
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 404, "User was not found");
      return;
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      sendError(res, 404, "Address not found");
      return;
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (postalCode) address.postalCode = postalCode;
    if (phone) address.phone = phone;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save();
    successMsg(res, 200, "Address updated successfully", user.addresses);
  },
);

// DELETE USER ADDRESS
const deleteUserAddress = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    const addressId = req.params.addressId as string;
    if (!userId || !addressId) {
      sendError(res, 400, "User ID and Address ID is required");
      return;
    }
    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 404, "User not found");
      return;
    }
    const address = user.addresses.id(addressId);
    if (!address) {
      sendError(res, 400, "Address not found");
      return;
    }

    address.deleteOne();
    await user.save();
    successMsg(res, 200, "Address deleted successfully", user.addresses);
  },
);

export {
  getUsers,
  GetUserById,
  updateUser,
  deleteUser,
  changePassword,
  getUserAddress,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  deleteUserProfile,
};
