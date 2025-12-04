// src/api/adminCatalogApi.js
import { http } from "./http";

// ===== SERVICES =====

// GET /admin/services
export const getAdminServices = async () => {
  const { data } = await http.get("/admin/services");
  return data;
};

// POST /admin/services
export const createAdminService = async (payload) => {
  const { data } = await http.post("/admin/services", payload);
  return data;
};

export const updateAdminService = async (id, payload) => {
  const { data } = await http.put(`/admin/services/${id}`, payload);
  return data;
};

// DELETE /admin/services/{id}
export const deleteAdminService = async (id) => {
  const { data } = await http.delete(`/admin/services/${id}`);
  return data;
};

// ===== HAIRSTYLES =====

// GET /admin/hairstyles
export const getAdminHairstyles = async () => {
  const { data } = await http.get("/admin/hairstyles");
  return data;
};

// POST /admin/hairstyles
export const createAdminHairstyle = async (payload) => {
  const { data } = await http.post("/admin/hairstyles", payload);
  return data;
};

export const updateAdminHairstyle = async (id, payload) => {
  const { data } = await http.put(`/admin/hairstyles/${id}`, payload);
  return data;
};

// DELETE /admin/hairstyles/{id}
export const deleteAdminHairstyle = async (id) => {
  const { data } = await http.delete(`/admin/hairstyles/${id}`);
  return data;
};

// ===== COUPONS =====

// GET /admin/coupons
export const getAdminCoupons = async () => {
  const { data } = await http.get("/admin/coupons");
  return data;
};

// POST /admin/coupons
export const createAdminCoupon = async (payload) => {
  const { data } = await http.post("/admin/coupons", payload);
  return data;
};

export const updateAdminCoupon = async (id, payload) => {
  const { data } = await http.put(`/admin/coupons/${id}`, payload);
  return data;
};

// DELETE /admin/coupons/{id}
export const deleteAdminCoupon = async (id) => {
  const { data } = await http.delete(`/admin/coupons/${id}`);
  return data;
};

// ===== PROMOS =====

// GET /admin/promos
export const getAdminPromos = async () => {
  const { data } = await http.get("/admin/promos");
  return data;
};

// POST /admin/promos
export const createAdminPromo = async (payload) => {
  const { data } = await http.post("/admin/promos", payload);
  return data;
};

export const updateAdminPromo = async (id, payload) => {
  const { data } = await http.put(`/admin/promos/${id}`, payload);
  return data;
};

// DELETE /admin/promos/{id}
export const deleteAdminPromo = async (id) => {
  const { data } = await http.delete(`/admin/promos/${id}`);
  return data;
};

// ===== REVIEWS =====

// GET /admin/reviews
export const getAdminReviews = async () => {
  const { data } = await http.get("/admin/reviews");
  return data;
};

// DELETE /admin/reviews/{id}
export const deleteAdminReview = async (id) => {
  const { data } = await http.delete(`/admin/reviews/${id}`);
  return data;
};
