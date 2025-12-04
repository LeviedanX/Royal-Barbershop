// src/api/csApi.js
import { http } from "./http";

export const csApi = {
  // list tiket (untuk customer = tiket miliknya, untuk admin = semua tiket)
  async list(params = {}) {
    const { data } = await http.get("/cs/tickets", { params });
    return data;
  },

  // buat tiket baru (customer)
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
 * === Named export untuk DashboardAdmin.jsx ===
 */

export async function fetchTickets(params = {}) {
  return csApi.list(params);
}

export default csApi;
