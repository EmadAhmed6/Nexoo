export type TicketCategory = "shipping" | "payment" | "product" | "other";
export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface TicketSender {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

export interface TicketMessage {
  _id: string;
  sender: TicketSender | string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TicketUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface TicketItem {
  _id: string;
  user: TicketUser | string;
  order?: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  messages: (TicketMessage | string)[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketInput {
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  message: string;
  order?: string;
}

export interface UpdateTicketInput {
  subject?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  status?: TicketStatus;
}
