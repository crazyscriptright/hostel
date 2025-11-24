// src/components/AdminSidebar.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaChevronCircleLeft,
  FaChevronCircleRight,
  FaTachometerAlt,
  FaUsers,
  FaComments,
  FaCog,
  FaUserTie,
  FaSignOutAlt,
} from "react-icons/fa";
import axios from "axios";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      // Determine if we're in production
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      
      // Use nuclear logout for production, regular logout for development
      const logoutEndpoint = isProduction 
        ? '/auth/admin/nuclear-logout'
        : '/auth/admin/logout';
      
      // Call logout endpoint to clear cookies
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}${logoutEndpoint}`,
        {},
        { 
          withCredentials: true,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
      
      // Clear admin data from localStorage
      localStorage.removeItem("admin_data");
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Navigate to login page with cache busting
      window.location.href = `/admin/login?_t=${Date.now()}`;
    } catch (err) {
      console.error("Logout failed:", err);
      // Even if logout fails, clear local data and redirect
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = `/admin/login?_t=${Date.now()}`;
    }
  };

  /* ───────── links (with wardens + guarded settings) ───────── */
  const links = [
    { to: "/admin/welcome",    label: "Dashboard",    icon: <FaTachometerAlt /> },
    { to: "/admin/users",      label: "Manage Users", icon: <FaUsers /> },
    { to: "/admin/wardens",    label: "Wardens",      icon: <FaUserTie /> },
    { to: "/admin/complaints", label: "Complaints",   icon: <FaComments /> },
    {
      to: "/admin/settings",
      label: "Settings",
      icon: <FaCog />,
      /* extra guard — ask before leaving */
      onGuard: () =>
        window.confirm(
          "You’re about to open Admin Settings. Continue only if this screen isn’t visible to students/wardens."
        ),
    },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white shadow-lg z-40 transition-all duration-300 ease-in-out ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <span
            className={`text-xl font-bold transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0 hidden"
            }`}
          >
            Admin Panel
          </span>
          <button
            onClick={toggleSidebar}
            className="text-white text-2xl transition-all hover:text-gray-300"
          >
            {isOpen ? <FaChevronCircleLeft /> : <FaChevronCircleRight />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col p-4 space-y-3">
          {links.map(({ to, label, icon, onGuard }) => (
            <Link
              key={to}
              to={to}
              onClick={(e) => {
                if (onGuard && !onGuard()) e.preventDefault();
              }}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-gray-700 ${
                location.pathname === to ? "bg-gray-700" : ""
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span
                className={`transition-opacity duration-300 ${
                  isOpen ? "opacity-100" : "opacity-0 hidden"
                }`}
              >
                {label}
              </span>
            </Link>
          ))}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 text-red-400 hover:text-red-500 p-3 rounded-lg transition-all"
          >
            <FaSignOutAlt className="text-xl" />
            <span
              className={`transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0 hidden"
              }`}
            >
              Logout
            </span>
          </button>
        </nav>
      </div>

      {/* content spacer */}
      <div
        className={`transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-20"
        }`}
      />
    </div>
  );
};

export default AdminSidebar;
