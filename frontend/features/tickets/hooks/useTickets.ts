"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketApi } from "../api/ticket.api";
import {
  TicketItem,
  TicketStatus,
  CreateTicketInput,
  UpdateTicketInput,
} from "../types/ticket.types";
import { useAppStore } from "@/store/use-app-store";
import { toast } from "sonner";

export const MY_TICKETS_QUERY_KEY = ["tickets", "my"] as const;
export const ALL_TICKETS_QUERY_KEY = ["tickets", "all"] as const;
export const ticketDetailKey = (id: string) => ["tickets", "detail", id] as const;

export function useMyTickets() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const query = useQuery({
    queryKey: MY_TICKETS_QUERY_KEY,
    queryFn: async () => {
      const res = await ticketApi.getMyTickets();
      return (res.data ?? []) as TicketItem[];
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  const tickets = query.data ?? [];
  const openCount = tickets.filter(
    (t) => t.status === "open" || t.status === "in_progress"
  ).length;

  return {
    ...query,
    tickets,
    openCount,
  };
}

export function useAllTickets() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const user = useAppStore((s) => s.user);
  const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin";

  const query = useQuery({
    queryKey: ALL_TICKETS_QUERY_KEY,
    queryFn: async () => {
      const res = await ticketApi.getAllTickets();
      return (res.data ?? []) as TicketItem[];
    },
    enabled: isAuthenticated && isAdmin,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  const tickets = query.data ?? [];

  return {
    ...query,
    tickets,
  };
}

export function useTicketOverview() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const user = useAppStore((s) => s.user);
  const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin";

  return useQuery({
    queryKey: ["admin", "tickets", "overview"],
    queryFn: async () => {
      const res = await ticketApi.getTicketOverview();
      return res.data ?? null;
    },
    enabled: isAuthenticated && isAdmin,
  });
}

export function useTicketDetails(ticketId: string | null) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ticketDetailKey(ticketId || ""),
    queryFn: async () => {
      if (!ticketId) return null;
      const res = await ticketApi.getTicketById(ticketId);
      return res.data as TicketItem;
    },
    enabled: Boolean(isAuthenticated && ticketId),
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketInput) => ticketApi.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_TICKETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALL_TICKETS_QUERY_KEY });
      toast.success("Ticket created successfully! Our support team will respond shortly.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create ticket");
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketInput }) =>
      ticketApi.updateTicket(id, data),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: MY_TICKETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALL_TICKETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ticketDetailKey(variables.id) });
      toast.success("Ticket updated successfully");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update ticket");
    },
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TicketStatus }) =>
      ticketApi.updateTicketStatus(id, status),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: MY_TICKETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALL_TICKETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ticketDetailKey(variables.id) });
      toast.success("Ticket status updated successfully");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update ticket status");
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketApi.deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_TICKETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALL_TICKETS_QUERY_KEY });
      toast.success("Ticket deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete ticket");
    },
  });
}

export function useAddTicketMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      ticketApi.addMessage(id, content),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ticketDetailKey(variables.id) });
      queryClient.invalidateQueries({ queryKey: MY_TICKETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ALL_TICKETS_QUERY_KEY });
      toast.success("Reply sent successfully");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to send message");
    },
  });
}
