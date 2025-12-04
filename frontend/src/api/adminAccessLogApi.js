// src/api/adminAccessLogApi.js
import { http } from "./http";

// GET /admin/access-logs
export const getAccessLogs = () =>
  http.get("/admin/access-logs").then((res) => res.data);

export const deleteAccessLog = (id) =>
  http.delete(`/admin/access-logs/${id}`).then((res) => res.data);

export const clearAccessLogs = () =>
  http.delete("/admin/access-logs").then((res) => res.data);
