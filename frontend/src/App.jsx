// src/App.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Shared components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// SEO Components
import { 
  HomeSEO, 
  AboutSEO, 
  RegisterSEO, 
  ComplaintsSEO, 
  AdminSEO, 
  WardenSEO, 
  DashboardSEO 
} from "./components/SEOHelmet";

// Public pages
import Hero from "./components/Hero";
import About from "./pages/About";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import RiseComplaint from "./pages/RaiseComplaint";

// Student pages
import ProtectedRoute from "./components/ProtectedRoute";
import StudentDashboard from "./pages/StudentDashboard";

// Admin pages
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLogin from "./pages/AdminLogin";
import AdminWelcome from "./pages/AdminWelcome";
import AdminUsers from "./components/AdminUsers";
import AdminWardens from "./components/AdminWardens";
import AdminComplaints from "./components/AdminComplaints";
import AdminSettings from "./components/AdminSettings";

// ✅ Warden pages
import WardenProtectedRoute from "./components/WardenProtectedRoute";
import WardenLogin from "./pages/warden/WardenLogin";
import WardenDashboard from "./pages/warden/WardenDashboard";

function App() {
  const location = useLocation();

  // ✅ Detect if we are on admin or warden page
  const isAdminPage = location.pathname.startsWith("/admin");
  const isWardenPage = location.pathname.startsWith("/warden");

  // ✅ Hide navbar & footer on admin & warden pages
  const hideLayout = isAdminPage || isWardenPage;

  return (
    <HelmetProvider>
      <div className="min-h-screen flex flex-col">
        {!hideLayout && <Navbar />}

        <main className="flex-grow">
          <Routes>
            {/* ✅ Public/student routes */}
            <Route path="/" element={
              <>
                <HomeSEO />
                <Hero />
              </>
            } />
            
            <Route path="/about" element={
              <>
                <AboutSEO />
                <About />
              </>
            } />
            
            <Route path="/register" element={
              <>
                <RegisterSEO />
                <Register />
              </>
            } />
            
            <Route path="/raise-complaint" element={
              <>
                <ComplaintsSEO />
                <RiseComplaint />
              </>
            } />
            
            <Route path="/reset-password/:shid" element={<ResetPassword />} />

            {/* ✅ Protected student routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardSEO />
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* ✅ Warden routes */}
            <Route path="/warden/login" element={
              <>
                <WardenSEO />
                <WardenLogin />
              </>
            } />
            
            <Route 
              path="/warden/dashboard" 
              element={
                <WardenProtectedRoute>
                  <WardenDashboard />
                </WardenProtectedRoute>
              } 
            />

            {/* ✅ Admin routes */}
            <Route path="/admin/login" element={
              <>
                <AdminSEO />
                <AdminLogin />
              </>
            } />
            
            <Route
              path="/admin/welcome"
              element={
                <AdminProtectedRoute>
                  <AdminWelcome />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminProtectedRoute>
                  <AdminUsers />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/wardens"
              element={
                <AdminProtectedRoute>
                  <AdminWardens />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <AdminProtectedRoute>
                  <AdminComplaints />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminProtectedRoute>
                  <AdminSettings />
                </AdminProtectedRoute>
              }
            />

            {/* ✅ TODO: Add a catch-all 404 route if needed */}
          </Routes>
        </main>

        {!hideLayout && <Footer />}
      </div>
    </HelmetProvider>
  );
}

export default App;
