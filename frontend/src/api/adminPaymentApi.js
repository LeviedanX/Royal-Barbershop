// src/api/adminPaymentApi.js
import { http } from "./http";

export const adminPaymentApi = {
  // ==== Payments monitoring ====
  async listPayments(params = {}) {
    const { data } = await http.get("/admin/payments", { params });
    return data;
  },

  async detailPayment(id) {
    const { data } = await http.get(`/admin/payments/${id}`);
    return data;
  },

  async createPayment(payload) {
    const { data } = await http.post("/admin/payments", payload);
    return data;
  },

  async updatePayment(id, payload) {
    const { data } = await http.put(`/admin/payments/${id}`, payload);
    return data;
  },

  async deletePayment(id) {
    const { data } = await http.delete(`/admin/payments/${id}`);
    return data;
  },

  // ==== Business hours ====
  async listBusinessHours() {
    const { data } = await http.get("/admin/business-hours");
    return data;
  },

  async updateBusinessHour(id, payload) {
    const { data } = await http.put(`/admin/business-hours/${id}`, payload);
    return data;
  },

  // Temporarily close or reopen the shop
  async toggleShopClosed(closed = true) {
    const { data } = await http.post("/admin/close-shop", { closed });
    return data;
  },

  // ==== Access log (who accessed the app) ====
  async listAccessLogs(params = {}) {
    const { data } = await http.get("/admin/access-logs", { params });
    return data;
  },
};

/**
 * === Named exports for DashboardAdmin.jsx (payments) ===
 */

export async function getPayments(params = {}) {
  return adminPaymentApi.listPayments(params);
}

export async function getPaymentDetail(id) {
  return adminPaymentApi.detailPayment(id);
}

export async function createPayment(payload) {
  return adminPaymentApi.createPayment(payload);
}

export async function updatePayment(id, payload) {
  return adminPaymentApi.updatePayment(id, payload);
}

export async function deletePayment(id) {
  return adminPaymentApi.deletePayment(id);
}

export default adminPaymentApi;
