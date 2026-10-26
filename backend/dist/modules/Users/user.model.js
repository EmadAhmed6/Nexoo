import { model, Schema } from "mongoose";
import { ChangePasswordSchema, CreateAddressSchema, ResendOtpSchema, UpdateAdressSchema, VerifyOtpSchema, } from "./user.schema.js";
import jwt from "jsonwebtoken";
import { ForgotPasswordSchema, LoginSchema, RegisterSchema, ResetPasswordSchema, } from "../Auth/auth.schema.js";
const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minLength: 4,
        unique: true,
    },
    fullName: {
        type: String,
        minLength: 4,
        maxLength: 100,
        required: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    addresses: [
        {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            postalCode: { type: String },
            phone: { type: String, required: true },
            isDefault: { type: Boolean, default: false },
        },
    ],
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    profilePicture: {
        url: {
            type: String,
            default: "",
        },
        publicId: {
            type: String,
            default: null,
        },
    },
    role: {
        type: String,
        enum: ["User", "Admin", "SuperAdmin"],
        default: "User",
    },
    provider: {
        type: String,
        enum: ["local", "google"],
        default: "local",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isBanned: {
        type: Boolean,
        default: false,
    },
    banExpires: {
        type: Date,
        default: null,
    },
    refreshToken: {
        type: String,
        select: false,
    },
    otp: {
        type: String,
        select: false,
    },
    otpExpired: {
        type: Date,
        select: false,
    },
}, { timestamps: true });
UserSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        id: this._id,
        role: this.role,
        username: this.username,
    }, process.env.JWT_SECRET_KEY, {
        expiresIn: "15m",
    });
};
UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: "7d" });
};
export const User = model("User", UserSchema);
const validateRegister = (user) => {
    return RegisterSchema.safeParse(user);
};
const validateLogin = (user) => {
    return LoginSchema.safeParse(user);
};
const validateCreateAddress = (address) => {
    return CreateAddressSchema.safeParse(address);
};
const validateUpdateAddress = (address) => {
    return UpdateAdressSchema.safeParse(address);
};
const validateForgotPassword = (user) => {
    return ForgotPasswordSchema.safeParse(user);
};
const validateResetPassword = (user) => {
    return ResetPasswordSchema.safeParse(user);
};
const validateVerifyOtp = (user) => {
    return VerifyOtpSchema.safeParse(user);
};
const validateChangePassword = (password) => {
    return ChangePasswordSchema.safeParse(password);
};
const validateResendOtp = (data) => {
    return ResendOtpSchema.safeParse(data);
};
export { validateRegister, validateLogin, validateCreateAddress, validateUpdateAddress, validateForgotPassword, validateResetPassword, validateVerifyOtp, validateChangePassword, validateResendOtp, };
//# sourceMappingURL=user.model.js.map