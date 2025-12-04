// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardBarber from "./pages/DashboardBarber";
import DashboardCustomer from "./pages/DashboardCustomer";
import BookingPage from "./pages/BookingPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import GalleryPage from "./pages/GalleryPage";
import QueueScreen from "./pages/QueueScreen";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import AdminPayouts from "./pages/AdminPayouts";

import "./App.css";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/queue" element={<QueueScreen />} />

      {/* Auth guest */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Any logged-in user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/help" element={<HelpCenterPage />} />
      </Route>

      {/* Admin only */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/dashboard/admin" element={<DashboardAdmin />} />
        {/* ⬇️ route baru untuk halaman AdminPayouts */}
        <Route path="/admin/payouts" element={<AdminPayouts />} />
      </Route>

      {/* Barber only */}
      <Route element={<ProtectedRoute requiredRole="barber" />}>
        <Route path="/dashboard/barber" element={<DashboardBarber />} />
      </Route>

      {/* Customer only */}
      <Route element={<ProtectedRoute requiredRole="customer" />}>
        <Route path="/dashboard/customer" element={<DashboardCustomer />} />
        <Route path="/booking" element={<BookingPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
