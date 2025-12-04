// src/api/barberApi.js
import { http } from "./http";

export const barberApi = {
  async list(params = {}) {
    const { data } = await http.get("/barbers", { params });
    return data;
  },

  async detail(id) {
    const { data } = await http.get(`/barbers/${id}`);
    return data;
  },
};

export default barberApi;
