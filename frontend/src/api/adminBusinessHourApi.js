// src/api/adminBusinessHourApi.js
import { http } from "./http";

// GET /admin/business-hours → ambil semua hari
export function getBusinessHours() {
  return http.get("/admin/business-hours").then((res) => res.data);
}

// PUT /admin/business-hours/{id} → update satu hari
export function updateBusinessHour(id, payload) {
  return http
    .put(`/admin/business-hours/${id}`, payload)
    .then((res) => res.data);
}

/**
 * TUTUP / BUKA TOKO
 * Backend pakai:
 *  - POST /admin/close-shop
 *  - POST /admin/open-shop-default
 */

// tutup semua hari (closed = true)
export function closeShop() {
  return http
    .post("/admin/close-shop")
    .then((res) => res.data);
}

// buka lagi dengan jam default 07:00–21:00 (semua hari)
export function openShopDefault() {
  return http
    .post("/admin/open-shop-default")
    .then((res) => res.data);
}
