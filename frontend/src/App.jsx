
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// Lazy Load Pages
const Login = lazy(() => import("./pages/auth/Login"));
const UserDashboard = lazy(() => import("./pages/user/UserDashboard"));
const UserBooking = lazy(() => import("./pages/user/UserBooking"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const OwnerDashboard = lazy(() => import("./pages/owner/OwnerDashboard"));

// Loading Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected User Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={["user", "admin", "owner"]}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book"
              element={
                <ProtectedRoute allowedRoles={["user", "admin", "owner"]}>
                  <UserBooking />
                </ProtectedRoute>
              }
            />

            {/* Protected Owner Routes */}
            <Route
              path="/owner"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
