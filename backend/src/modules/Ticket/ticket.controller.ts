import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { sendError, successMsg } from "../../middlewares/errors.js";
import {
  Ticket,
  validateCreateTicket,
  validateUpdateTicket,
} from "./ticket.model.js";
import { Message } from "./Message/message.model.js";

// USER GET ALL TICKETS
const getUserTickets = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const tickets = await Ticket.find({ user: userId })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });
    successMsg(res, 200, "Your Tickets fetched successfully", tickets);
  },
);

// GET TICKET BY ID
const getTicketById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const ticketId = req.params.ticketId as string;
    const ticket = await Ticket.findById(ticketId)
      .populate("user", "firstName lastName email")
      .populate({
        path: "messages",
        populate: { path: "sender", select: "firstName lastName email role" },
      });

    if (!ticket) {
      sendError(res, 404, "No Ticket found with this id");
      return;
    }

    successMsg(res, 200, "Ticket fetched successfully", ticket);
  },
);

// ADD TICKET
const createTicket = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { error, success } = validateCreateTicket(req.body);
    if (!success) {
      sendError(res, 400, error.issues[0]?.message || "Invalid Inputs");
      return;
    }
    const userId = req.user?.id;

    const { subject, order, category, priority, message } = req.body;
    const initialMessage = await Message.create({
      sender: userId,
      content: message,
    });
    const ticket = new Ticket({
      subject,
      user: userId,
      order,
      category,
      priority,
      messages: [initialMessage._id],
    });
    const finalTicket = await ticket.save();
    successMsg(res, 201, "Ticket created successfully", finalTicket);
  },
);

// UPDATE TICKET
const updateTicket = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { error, success } = validateUpdateTicket(req.body);
    if (!success) {
      sendError(res, 400, error.issues[0]?.message || "Invalid Inputs");
      return;
    }
    const ticketId = req.params.ticketId as string;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      sendError(res, 404, "No Ticket found with this id");
      return;
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(ticketId, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("user", "firstName lastName email")
      .populate({
        path: "messages",
        populate: { path: "sender", select: "firstName lastName email role" },
      });

    successMsg(res, 200, "Ticket updated successfully", updatedTicket);
  },
);

// DELETE TICKET
const deleteTicket = asyncHandler(async (req: Request, res: Response) => {
  const ticketId = req.params.ticketId as string;
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    sendError(res, 404, "No Ticket found with this id");
    return;
  }

  const deletedTicket = await Ticket.findByIdAndDelete(ticketId);
  successMsg(res, 200, "Ticket deleted successfully", deletedTicket);
});

// ADD MESSAGE / REPLY TO TICKET
const addMessageToTicket = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const ticketId = req.params.ticketId as string;
    const { content } = req.body;
    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      sendError(res, 400, "Message content is required");
      return;
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      sendError(res, 404, "No Ticket found with this id");
      return;
    }

    const message = await Message.create({
      sender: req.user?.id,
      content: content.trim(),
    });

    ticket.messages.push(message._id as any);
    await ticket.save();

    const populatedTicket = await Ticket.findById(ticketId)
      .populate("user", "firstName lastName email")
      .populate({
        path: "messages",
        populate: { path: "sender", select: "firstName lastName email role" },
      });

    successMsg(res, 201, "Message added successfully", populatedTicket);
  },
);

export {
  getUserTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  addMessageToTicket,
};
