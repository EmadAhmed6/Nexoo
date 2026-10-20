import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { User, validateCreateAddress, validateUpdateAddress, } from "./user.model.js";
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
// ============== USER ADDRESSES ==============
// GET USER ADDRESSES
const getUserAddress = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
        sendError(res, 404, "User not found");
        return;
    }
    successMsg(res, 200, "User addresses fetched successfully", user.addresses);
});
// ADD NEW ADDRESS
const addUserAddress = asyncHandler(async (req, res) => {
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
    user.addresses.push(address);
    await user.save();
    successMsg(res, 200, "Address added successfully", user.addresses);
});
// UPDATE USER ADDRESS
const updateUserAddress = asyncHandler(async (req, res) => {
    const { success, error } = validateUpdateAddress(req.body);
    if (!success) {
        sendError(res, 400, error.message);
        return;
    }
    const userId = req.params.userId;
    const addressId = req.params.addressId;
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
    if (street)
        address.street = street;
    if (city)
        address.city = city;
    if (state)
        address.state = state;
    if (postalCode)
        address.postalCode = postalCode;
    if (phone)
        address.phone = phone;
    if (isDefault !== undefined)
        address.isDefault = isDefault;
    await user.save();
    successMsg(res, 200, "Address updated successfully", user.addresses);
});
// DELETE USER ADDRESS
const deleteUserAddress = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const addressId = req.params.addressId;
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
});
export { getUsers, GetUserById, updateUser, deleteUser, getUserAddress, addUserAddress, updateUserAddress, deleteUserAddress, };
//# sourceMappingURL=user.controller.js.map