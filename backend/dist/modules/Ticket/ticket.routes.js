import express from "express";
import { getUserTickets, getTicketById, createTicket, updateTicket, deleteTicket, addMessageToTicket, } from "./ticket.controller.js";
import { verifyTicketOwner, verifyToken, } from "../../middlewares/verifyToken.js";
const router = express.Router();
router
    .route("/")
    .post(verifyToken, createTicket);
router.route("/my").get(verifyToken, getUserTickets);
router
    .route("/:ticketId")
    .get(verifyTicketOwner, getTicketById)
    .put(verifyTicketOwner, updateTicket)
    .delete(verifyTicketOwner, deleteTicket);
router.route("/:ticketId/messages").post(verifyTicketOwner, addMessageToTicket);
export default router;
//# sourceMappingURL=ticket.routes.js.map