// src/api/adminPayoutApi.js
import { http } from "./http";

const adminPayoutApi = {
  async list(params = {}) {
    const { data } = await http.get("/admin/payouts", { params });
    return data; // paginated
  },

  async create(payload) {
    const { data } = await http.post("/admin/payouts", payload);
    return data;
  },

  async updateStatus(id, payload) {
    const { data } = await http.patch(`/admin/payouts/${id}/status`, payload);
    return data;
  },

  async show(id) {
    const { data } = await http.get(`/admin/payouts/${id}`);
    return data;
  },

  // 🔥 BARU: hapus payout
  async delete(id) {
    const { data } = await http.delete(`/admin/payouts/${id}`);
    return data;
  },
};

export default adminPayoutApi;
