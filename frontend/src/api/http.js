// src/api/http.js
import axios from "axios";

const resolveBaseUrl = () => {
  const envBase = import.meta.env.VITE_API_BASE_URL;
  if (envBase) return envBase.replace(/\/$/, "");

  // fallback: pakai origin host tempat frontend disajikan (berguna saat deploy di mesin berbeda)
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin.replace(/\/$/, "");
  }

  return "http://127.0.0.1:8000";
};

const base = resolveBaseUrl();

// hasil: http://127.0.0.1:8000/api
export const http = axios.create({
  baseURL: `${base}/api`,
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
});

// helper untuk set / hapus token
export function setAuthToken(token) {
  if (token) {
    http.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem("auth_token", token);
  } else {
    delete http.defaults.headers.common.Authorization;
    localStorage.removeItem("auth_token");
  }
}

// interceptor error (biarkan simple dulu)
http.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error)
);

export default http;
