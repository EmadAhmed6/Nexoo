import { Document, model, Schema, Types } from "mongoose";
import { CreateTicketSchema, UpdateTicketSchema } from "./ticket.schema.js";

interface ITicket extends Document {
  user: Types.ObjectId;
  order?: Types.ObjectId;
  subject: string;
  category: "shipping" | "payment" | "product" | "other";
  status: "closed" | "resolved" | "in_progress" | "open";
  priority: "Low" | "Medium" | "High" | "Urgent";
  messages: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    order: {
      type: Types.ObjectId,
      ref: "Order",
      required: false,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["shipping", "payment", "product", "other"],
      required: true,
      default: "other",
    },
    status: {
      type: String,
      enum: ["closed", "resolved", "in_progress", "open"],
      required: true,
      default: "open",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      required: true,
      default: "Medium",
    },
    messages: [
      {
        type: Types.ObjectId,
        ref: "Message",
        default: [],
      },
    ],
  },
  { timestamps: true },
);

const Ticket = model<ITicket>("Ticket", TicketSchema);
const validateCreateTicket = (body: ITicket) =>
  CreateTicketSchema.safeParse(body);

const validateUpdateTicket = (body: ITicket) =>
  UpdateTicketSchema.safeParse(body);

export { Ticket, validateCreateTicket, validateUpdateTicket };
