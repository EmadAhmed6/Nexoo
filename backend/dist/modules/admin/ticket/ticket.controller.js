import asyncHandler from "express-async-handler";
import { sendError, successMsg } from "../../../middlewares/errors.js";
import { Ticket } from "../../../modules/Ticket/ticket.model.js";
// GET ALL TICKET
const getAllTickets = asyncHandler(async (req, res) => {
    const { status, search } = req.query;
    const query = {};
    if (status && typeof status === "string" && status !== "all") {
        query.status = status;
    }
    if (search && typeof search === "string" && search.trim() !== "") {
        query.title = { $regex: search, $options: "i" };
    }
    const tickets = await Ticket.find(query)
        .populate("user", "firstName lastName email")
        .sort({ createdAt: -1 });
    successMsg(res, 200, "Tickets fetched successfully", tickets);
});
// UPDATE TICKET STATUS
const updateTicketStatus = asyncHandler(async (req, res) => {
    const { ticketId } = req.params;
    if (!ticketId) {
        sendError(res, 400, "Ticket ID is required");
        return;
    }
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        sendError(res, 404, "Ticket not found");
        return;
    }
    const status = req.body.status;
    if (!status) {
        sendError(res, 400, "Status is required");
        return;
    }
    ticket.status = status;
    await ticket.save();
    successMsg(res, 200, "Ticket updated successfully", ticket);
});
// GET TICKET OVERVIEW
const getTicketOverview = asyncHandler(async (req, res) => {
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: "open" });
    const inprogressTickets = await Ticket.countDocuments({
        status: "in_progress",
    });
    const resolvedTickets = await Ticket.countDocuments({ status: "resolved" });
    const closedTickets = await Ticket.countDocuments({ status: "closed" });
    successMsg(res, 200, "Ticket overview fetched successfully", {
        totalTickets,
        openTickets,
        inprogressTickets,
        resolvedTickets,
        closedTickets,
    });
});
export { getAllTickets, updateTicketStatus, getTicketOverview };
//# sourceMappingURL=ticket.controller.js.map