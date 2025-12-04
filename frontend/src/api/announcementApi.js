// src/api/announcementApi.js
import { http } from "./http";

export const announcementApi = {
  async list(params = {}) {
    const { data } = await http.get("/announcements", { params });
    return data;
  },

  // === admin only (dipakai di DashboardAdmin) ===
  async create(payload) {
    // { title, content, starts_at?, ends_at?, target_role?, is_active? }
    const { data } = await http.post("/announcements", payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await http.put(`/announcements/${id}`, payload);
    return data;
  },

  async remove(id) {
    const { data } = await http.delete(`/announcements/${id}`);
    return data;
  },
};

/**
 * === Named exports untuk DashboardAdmin.jsx ===
 */

export async function fetchAnnouncements(params = {}) {
  return announcementApi.list(params);
}

export async function createAnnouncement(payload) {
  return announcementApi.create(payload);
}

export async function updateAnnouncement(id, payload) {
  return announcementApi.update(id, payload);
}

export async function deleteAnnouncement(id) {
  return announcementApi.remove(id);
}

export default announcementApi;
