import { model, Schema, Types } from "mongoose";
import { CreateTicketSchema, UpdateTicketSchema } from "./ticket.schema.js";
const TicketSchema = new Schema({
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
}, { timestamps: true });
const Ticket = model("Ticket", TicketSchema);
const validateCreateTicket = (body) => CreateTicketSchema.safeParse(body);
const validateUpdateTicket = (body) => UpdateTicketSchema.safeParse(body);
export { Ticket, validateCreateTicket, validateUpdateTicket };
//# sourceMappingURL=ticket.model.js.map