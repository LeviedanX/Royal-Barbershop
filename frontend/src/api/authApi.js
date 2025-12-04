// src/api/authApi.js
import { http } from "./http";

export const authApi = {
  async getCsrf() {
    // kalau backend tidak pakai route ini, panggilan akan gagal tapi tidak apa-apa
    try {
      await http.get("/sanctum/csrf-cookie");
    } catch (_) {
      // ignore
    }
  },

  async login(email, password) {
    await authApi.getCsrf();
    const { data } = await http.post("/login", { email, password });
    return data; // biasanya { user: {...} }
  },

  async register(payload) {
    // payload: { name, email, password, password_confirmation }
    const { data } = await http.post("/register", payload);
    return data;
  },

  async me() {
    const { data } = await http.get("/me");
    return data;
  },

  async logout() {
    const { data } = await http.post("/logout");
    return data;
  },
};

export default authApi;
