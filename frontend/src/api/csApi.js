// src/api/csApi.js
import { http } from "./http";

export const csApi = {
  // List tickets (customer sees their own; admin sees all)
  async list(params = {}) {
    const { data } = await http.get("/cs/tickets", { params });
    return data;
  },

  // Create a new ticket (customer)
  async createTicket(payload) {
    // payload: { subject, message }
    const { data } = await http.post("/cs/tickets", payload);
    return data;
  },

  async detail(id) {
    const { data } = await http.get(`/cs/tickets/${id}`);
    return data;
  },

  async reply(id, payload) {
    // payload: { message }
    const { data } = await http.post(`/cs/tickets/${id}/reply`, payload);
    return data;
  },
};

/**
 * === Named export for DashboardAdmin.jsx ===
 */

export async function fetchTickets(params = {}) {
  return csApi.list(params);
}

export default csApi;
