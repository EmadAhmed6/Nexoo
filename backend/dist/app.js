import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import auth from "./modules/auth/auth.routes.js";
import connectToDB from "./config/config.js";
dotenv.config();
connectToDB();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", auth);
app.listen(PORT, () => console.log("Server is running on port", PORT));
//# sourceMappingURL=app.js.map