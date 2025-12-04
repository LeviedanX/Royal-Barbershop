// src/api/authApi.js
import { http } from "./http";

export const authApi = {
  async getCsrf() {
    // If the backend does not expose this route, the call will fail but can be ignored
    try {
      await http.get("/sanctum/csrf-cookie");
    } catch (_) {
      // ignore
    }
  },

  async login(email, password) {
    await authApi.getCsrf();
    const { data } = await http.post("/login", { email, password });
    return data; // usually { user: {...} }
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
