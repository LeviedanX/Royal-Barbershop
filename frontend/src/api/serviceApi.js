// src/api/serviceApi.js
import { http } from "./http";

export const serviceApi = {
  async list(params = {}) {
    const { data } = await http.get("/services", { params });
    return data;
  },

  async detail(id) {
    const { data } = await http.get(`/services/${id}`);
    return data;
  },
};

export default serviceApi;
