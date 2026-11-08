import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { sendError, successMsg } from "../../../middlewares/errors.js";
import { Ticket } from "../../../modules/Ticket/ticket.model.js";
import { redis } from "../../../config/redis.js";
import { RedisSentinel } from "redis";

// GET ALL TICKET
const getAllTickets = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { status, search } = req.query;
    const queryParamsString = JSON.stringify({ status, search });
    const cacheKey = `admin:tickets:${queryParamsString}`;

    const cachedTickets = await redis.get(cacheKey);
    if (cachedTickets) {
      successMsg(
        res,
        200,
        "Tickets fetched successfully",
        JSON.parse(cachedTickets),
        "cache",
      );
      return;
    }
    const query: Record<string, any> = {};
    if (status && typeof status === "string" && status !== "all") {
      query.status = status;
    }
    if (search && typeof search === "string" && search.trim() !== "") {
      query.title = { $regex: search, $options: "i" };
    }
    const tickets = await Ticket.find(query)
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    await redis.set(cacheKey, JSON.stringify(tickets), { EX: 600 });
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
    const keys = await redis.keys("admin:tickets:*");
    if (keys.length > 0) {
      await redis.del(keys);
    }
    successMsg(res, 200, "Ticket updated successfully", ticket);
  },
);

// GET TICKET OVERVIEW
const getTicketOverview = asyncHandler(async (req: Request, res: Response) => {
  const cacheKey = "admin:tickets:overview";

  const cachedOverview = await redis.get(cacheKey);
  if (cachedOverview) {
    successMsg(
      res,
      200,
      "Ticket Stats fetched successfully",
      JSON.parse(cachedOverview),
      "cache",
    );
    return;
  }
  const totalTickets = await Ticket.countDocuments();
  const openTickets = await Ticket.countDocuments({ status: "open" });
  const inprogressTickets = await Ticket.countDocuments({
    status: "in_progress",
  });
  const resolvedTickets = await Ticket.countDocuments({ status: "resolved" });
  const closedTickets = await Ticket.countDocuments({ status: "closed" });
  
  const ticketStats = {
    totalTickets,
    openTickets,
    inprogressTickets,
    resolvedTickets,
    closedTickets,
  };

  await redis.set(cacheKey, JSON.stringify(ticketStats), { EX: 600 });
  successMsg(res, 200, "Ticket overview fetched successfully", ticketStats);
});

export { getAllTickets, updateTicketStatus, getTicketOverview };
