import { model, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import { LoginSchema, RegisterSchema, } from "../auth/auth.schema.js";
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
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    profilePicture: {
        type: {
            url: String,
            publicId: { type: String, default: null },
        },
        default: {
            url: "",
            publicId: null,
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
export const User = model("User", UserSchema);
const validateRegister = (user) => {
    return RegisterSchema.safeParse(user);
};
const validateLogin = (user) => {
    return LoginSchema.safeParse(user);
};
export { validateRegister, validateLogin };
//# sourceMappingURL=user.model.js.map