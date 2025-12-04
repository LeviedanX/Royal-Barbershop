// src/components/routing/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * ProtectedRoute
 * - Jika belum login → redirect ke /login
 * - Jika requiredRole di-set dan role user tidak cocok → redirect ke dashboard role-nya sendiri
 *
 * Cara pakai di App.jsx (React Router v6):
 *
 * <Route element={<ProtectedRoute requiredRole="admin" />}>
 *   <Route path="/dashboard/admin" element={<DashboardAdmin />} />
 * </Route>
 *
 * <Route element={<ProtectedRoute requiredRole="customer" />}>
 *   <Route path="/dashboard/customer" element={<DashboardCustomer />} />
 *   <Route path="/booking" element={<BookingPage />} />
 * </Route>
 */
export default function ProtectedRoute({ requiredRole }) {
  const { user, initialLoading } = useAuth(); // tetap pakai initialLoading dari hook-mu

  // Loading awal cek session
  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 text-sm">
        Checking session...
      </div>
    );
  }

  // Belum login → ke login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Cek role kalau diminta
  if (requiredRole && user.role !== requiredRole) {
    const fallback =
    user.role === "admin"
        ? "/dashboard/admin"
        : user.role === "barber"
        ? "/dashboard/barber"
        : user.role === "customer"
        ? "/dashboard/customer"
        : "/";

    return <Navigate to={fallback} replace />;
  }

  // Lolos semua → render child routes
  return <Outlet />;
}
