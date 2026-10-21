import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { sendError, successMsg } from "../../../middlewares/errors.js";
import { Ticket } from "../../../modules/Ticket/ticket.model.js";

// GET ALL TICKET
const getAllTickets = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const tickets = await Ticket.find()
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });
    successMsg(res, 200, "Tickets fetched successfully", tickets);
  },
);

// UPDATE TICKET STATUS
const updateTicketStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
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
  },
);

export { getAllTickets, updateTicketStatus };
