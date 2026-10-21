import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/axios-client";
import {
  TicketItem,
  TicketStatus,
  CreateTicketInput,
  UpdateTicketInput,
} from "../types/ticket.types";

export const ticketApi = {
  /**
   * Fetch tickets created by current authenticated user
   */
  getMyTickets: async () => {
    return apiGet<TicketItem[]>("/tickets/my");
  },

  /**
   * Fetch all platform tickets (Admin only)
   */
  getAllTickets: async () => {
    return apiGet<TicketItem[]>("/admin/tickets");
  },

  /**
   * Update ticket status (Admin only)
   */
  updateTicketStatus: async (ticketId: string, status: TicketStatus) => {
    return apiPut<TicketItem, { status: TicketStatus }>(
      `/admin/tickets/${ticketId}`,
      { status }
    );
  },

  /**
   * Get single ticket by ID with populated messages
   */
  getTicketById: async (ticketId: string) => {
    return apiGet<TicketItem>(`/tickets/${ticketId}`);
  },

  /**
   * Create a new support ticket
   */
  createTicket: async (data: CreateTicketInput) => {
    return apiPost<TicketItem, CreateTicketInput>("/tickets", data);
  },

  /**
   * Update ticket fields or status
   */
  updateTicket: async (ticketId: string, data: UpdateTicketInput) => {
    return apiPut<TicketItem, UpdateTicketInput>(`/tickets/${ticketId}`, data);
  },

  /**
   * Delete ticket permanently
   */
  deleteTicket: async (ticketId: string) => {
    return apiDelete<TicketItem>(`/tickets/${ticketId}`);
  },

  /**
   * Add a message / reply to a ticket conversation
   */
  addMessage: async (ticketId: string, content: string) => {
    return apiPost<TicketItem, { content: string }>(`/tickets/${ticketId}/messages`, {
      content,
    });
  },
};
