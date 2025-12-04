// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { http, setAuthToken } from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // Cek token + /me saat pertama kali load SPA
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const savedToken = localStorage.getItem("auth_token");

      // kalau tidak ada token sama sekali → langsung selesai
      if (!savedToken) {
        setInitialLoading(false);
        return;
      }

      // kalau ada token, pasang dulu ke axios
      setAuthToken(savedToken);

      try {
        const { data } = await http.get("/me");
        if (!isMounted) return;
        setUser(data);
      } catch (err) {
        // token tidak valid / expired → hapus
        if (!isMounted) return;
        setAuthToken(null);
        setUser(null);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      // kita tidak pakai cookie Sanctum SPA, tapi token Bearer
      const { data } = await http.post("/login", { email, password });

      const token = data.token;             // dari AuthController@login
      const loggedUser = data.user || data; // jaga2

      // simpan token ke axios + localStorage
      setAuthToken(token);
      setUser(loggedUser);

      return loggedUser;
    } finally {
      setAuthLoading(false);
    }
  };

  // Register hanya untuk customer
  const register = async (payload) => {
    setAuthLoading(true);
    try {
      const { data } = await http.post("/register", payload);
      return data;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await http.post("/logout");
    } catch (err) {
      console.error(err);
    } finally {
      // hapus token dari axios + localStorage
      setAuthToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    initialLoading,
    authLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
