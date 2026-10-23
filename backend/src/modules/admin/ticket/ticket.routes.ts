import express from "express";
import {
  getAllTickets,
  updateTicketStatus,
  getTicketOverview,
} from "./ticket.controller.js";
import { verifyAdminToken } from "../../../middlewares/verifyToken.js";

const router = express.Router();

router.get("/overview", verifyAdminToken, getTicketOverview);
router.route("/").get(verifyAdminToken, getAllTickets);
router.route("/:ticketId").put(verifyAdminToken, updateTicketStatus);

export default router;
