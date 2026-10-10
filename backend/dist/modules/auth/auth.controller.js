import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import { sendError, successMsg } from "../../middlewares/errors.js";
import { User, validateRegister } from "../Users/user.model.js";
const register = asyncHandler(async (req, res) => {
    const { error, success } = validateRegister(req.body);
    if (!success) {
        sendError(res, 400, error?.message || "Something went wrong");
        return;
    }
    const user = await User.findOne({ email: req.body.email });
    if (user) {
        sendError(res, 400, "Email is already in use");
        return;
    }
    const genSalt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, genSalt);
    const newUser = new User({
        fullName: req.body.fullName,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        provider: "local",
        isVerified: false,
    });
    const finalUser = await newUser.save();
    const accessToken = finalUser.generateAccessToken();
    const { password, ...others } = finalUser.toObject();
    successMsg(res, 201, "User registered successfully", finalUser);
    // const { error, success } = validateRegister(req.body);
    // if (!success) {
    //   sendError(res, 400, error?.message || "Something went wrong");
    //   return;
    // }
    // const user = await User.findOne({ email: req.body.email });
    // if (user) {
    //   sendError(res, 400, "User is already exist");
    //   return;
    // }
    // const genSalt = await bcrypt.genSalt(10);
    // req.body.password = await bcrypt.hash(req.body.password, genSalt);
    // const newUser = new User({
    //   fullName: req.body.fullName,
    //   username: req.body.username,
    //   email: req.body.email,
    //   password: req.body.password,
    //   provider: "local",
    //   isVerified: false,
    // });
    // const finalUser = await newUser.save();
    // const accessToken = finalUser.generateAccessToken();
    // const { password, ...others } = finalUser.toObject();
    // successMsg(res, 201, "User registered successfully", {
    //   ...others,
    //   accessToken,
    // });
});
export { register };
//# sourceMappingURL=auth.controller.js.map