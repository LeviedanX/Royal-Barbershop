// src/components/routing/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * ProtectedRoute
 * - If not logged in -> redirect to /login
 * - If requiredRole is set and the user's role differs -> redirect to their own dashboard
 *
 * Usage in App.jsx (React Router v6):
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
  const { user, initialLoading } = useAuth(); // keep using initialLoading from the hook

  // Initial loading: checking session
  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 text-sm">
        Checking session...
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
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

  // Passed all checks -> render child routes
  return <Outlet />;
}
