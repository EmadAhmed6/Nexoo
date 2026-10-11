import express from "express";
import { login, register, getAuthMe } from "./auth.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.route("/me").get(verifyToken, getAuthMe);
export default router;
//# sourceMappingURL=auth.routes.js.map