// src/api/adminUserApi.js
import { http } from "./http";

export const adminUserApi = {
  // === BARBER ===
  async listBarbers(params = {}) {
    const { data } = await http.get("/admin/users/barbers", { params });
    return data;
  },

  async createBarber(payload) {
    // { name, email, password, ... }
    const { data } = await http.post("/admin/users/barbers", payload);
    return data;
  },

  async updateBarber(id, payload) {
    const { data } = await http.put(`/admin/users/barbers/${id}`, payload);
    return data;
  },

  async deleteBarber(id) {
    const { data } = await http.delete(`/admin/users/barbers/${id}`);
    return data;
  },

  // === CUSTOMER ===
  async listCustomers(params = {}) {
    const { data } = await http.get("/admin/users/customers", { params });
    return data;
  },

  async createCustomer(payload) {
    const { data } = await http.post("/admin/users/customers", payload);
    return data;
  },

  async updateCustomer(id, payload) {
    const { data } = await http.put(`/admin/users/customers/${id}`, payload);
    return data;
  },

  async deleteCustomer(id) {
    const { data } = await http.delete(`/admin/users/customers/${id}`);
    return data;
  },

  // === Ganti password (admin bisa ganti password user lain) ===
  async changePassword(id, payload) {
    // payload: { password, password_confirmation } atau bentuk lain sesuai backend
    const { data } = await http.post(
      `/admin/users/${id}/change-password`,
      payload
    );
    return data;
  },

  // ganti password dirinya sendiri
  async changeMyPassword(payload) {
    const { data } = await http.post("/admin/change-my-password", payload);
    return data;
  }
};

/**
 * === Named exports yang dipakai DashboardAdmin.jsx ===
 */

export async function getBarbers(params = {}) {
  return adminUserApi.listBarbers(params);
}

export async function createBarber(payload) {
  return adminUserApi.createBarber(payload);
}

export async function updateBarber(id, payload) {
  return adminUserApi.updateBarber(id, payload);
}

export async function deleteBarber(id) {
  return adminUserApi.deleteBarber(id);
}

export async function getCustomers(params = {}) {
  return adminUserApi.listCustomers(params);
}

export async function createCustomer(payload) {
  return adminUserApi.createCustomer(payload);
}

export async function updateCustomer(id, payload) {
  return adminUserApi.updateCustomer(id, payload);
}

export async function deleteCustomer(id) {
  return adminUserApi.deleteCustomer(id);
}

// ganti password dirinya sendiri (admin)
export async function changeMyPassword(payload) {
  return adminUserApi.changeMyPassword(payload);
}

// admin ganti password user lain
export async function adminChangeUserPassword(id, payload) {
  return adminUserApi.changePassword(id, payload);
}

export default adminUserApi;
