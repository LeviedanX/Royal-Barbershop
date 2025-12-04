// src/api/adminBusinessHourApi.js
import { http } from "./http";

// GET /admin/business-hours -> fetch all days
export function getBusinessHours() {
  return http.get("/admin/business-hours").then((res) => res.data);
}

// PUT /admin/business-hours/{id} -> update a single day
export function updateBusinessHour(id, payload) {
  return http.put(`/admin/business-hours/${id}`, payload).then((res) => res.data);
}

/**
 * SHOP OPEN/CLOSE
 * Backend endpoints:
 *  - POST /admin/close-shop
 *  - POST /admin/open-shop-default
 */

// Close all days (closed = true)
export function closeShop() {
  return http.post("/admin/close-shop").then((res) => res.data);
}

// Reopen with default hours 07:00-21:00 (all days)
export function openShopDefault() {
  return http.post("/admin/open-shop-default").then((res) => res.data);
}
