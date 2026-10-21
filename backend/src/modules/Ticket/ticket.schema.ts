import { z } from "zod";

const CreateTicketSchema = z.object({
  subject: z
    .string()
    .min(1, "Subject is required")
    .min(3, "Subject must be at least 3 characters")
    .max(100, "Subject must be at most 100 characters"),
  category: z
    .string()
    .min(1, "Category is required")
    .min(3, "Category must be at least 3 characters")
    .max(100, "Category must be at most 100 characters"),
  priority: z
    .string()
    .min(1, "Priority is required")
    .min(3, "Priority must be at least 3 characters")
    .max(100, "Priority must be at most 100 characters"),
  message: z
    .string()
    .min(1, "Message is required")
    .min(3, "Message must be at least 3 characters")
    .max(1000, "Message must be at most 1000 characters"),
  order: z.string().optional(),
});

const UpdateTicketSchema = CreateTicketSchema.partial().extend({
  status: z.enum(["closed", "resolved", "in_progress", "open"]).optional(),
});

export { CreateTicketSchema, UpdateTicketSchema };
