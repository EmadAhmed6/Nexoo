import express from "express";
import { login, register, getAuthMe } from "./auth.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const router = express.Router();
// SFASFASF
router.post("/register", register);
router.post("/login", login);
router.route("/me").get(verifyToken, getAuthMe);

export default router;
