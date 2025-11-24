import React, { useState } from "react";
import { FaChartBar, FaUser, FaHistory } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import axios from "axios";

const UserSideBar = ({ onSelect, active }) => {
  const studentName = localStorage.getItem("studentName") || "Student";

  const handleLogout = async () => {
    try {
      // Determine if we're in production
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      
      // Use nuclear logout for production, regular logout for development
      const logoutEndpoint = isProduction 
        ? '/auth/user/nuclear-logout'
        : '/auth/user/logout';
      
      // Call logout endpoint to clear JWT cookies
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
      
      // For production: manually clear all possible cookies
      const cookiesToClear = [
        'user_access_token',
        'user_refresh_token', 
        'admin_access_token',
        'admin_refresh_token',
        'warden_access_token', 
        'warden_refresh_token',
        'access_token',
        'refresh_token',
        'sessionid',
        'csrftoken'
      ];
      
      cookiesToClear.forEach(cookieName => {
        // Clear for current domain
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        // Clear for parent domain (production)
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname.split('.').slice(-2).join('.')};`;
        // Clear without domain
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
    } catch (err) {
      console.error("Logout failed:", err);
      // Even if logout fails, clear local data and redirect
    } finally {
      // Clear all localStorage data
      localStorage.clear();
      // Clear sessionStorage as well
      sessionStorage.clear();
      // Force a full page reload to ensure clean state with cache busting
      window.location.href = `/?_t=${Date.now()}`;
    }
  };

  return (
    <aside className="w-full sm:w-64 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 shadow-xl border-r border-slate-700">
      {/* Student Name */}
      <div className="mb-6">
        <h2 className="text-xl font-bold truncate text-indigo-400">
          {studentName}
        </h2>
        <button
          onClick={handleLogout}
          className="mt-2 w-full bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md shadow text-sm font-semibold transition"
        >
          Logout
        </button>
      </div>

      {/* Sidebar Navigation */}
      <ul className="space-y-3">
        <li
          onClick={() => onSelect("dashboard")}
          className={`cursor-pointer flex items-center gap-3 px-4 py-2 rounded-lg transition ${
            active === "dashboard"
              ? "bg-indigo-600 shadow-lg"
              : "hover:bg-indigo-500/20 hover:shadow-md"
          }`}
        >
          <MdDashboard size={20} /> Dashboard
        </li>
        <li
          onClick={() => onSelect("student")}
          className={`cursor-pointer flex items-center gap-3 px-4 py-2 rounded-lg transition ${
            active === "student"
              ? "bg-indigo-600 shadow-lg"
              : "hover:bg-indigo-500/20 hover:shadow-md"
          }`}
        >
          <FaUser size={20} /> Student Info
        </li>
        <li
          onClick={() => onSelect("complaints")}
          className={`cursor-pointer flex items-center gap-3 px-4 py-2 rounded-lg transition ${
            active === "complaints"
              ? "bg-indigo-600 shadow-lg"
              : "hover:bg-indigo-500/20 hover:shadow-md"
          }`}
        >
          <FaHistory size={20} /> Complaints
        </li>
        <li
          onClick={() => onSelect("raise")}
          className={`cursor-pointer flex items-center gap-3 px-4 py-2 rounded-lg transition ${
            active === "raise"
              ? "bg-indigo-600 shadow-lg"
              : "hover:bg-indigo-500/20 hover:shadow-md"
          }`}
        >
          <FaChartBar size={20} /> Raise Complaint
        </li>
        <li
          onClick={() => onSelect("feedbacks")}
          className={`cursor-pointer flex items-center gap-3 px-4 py-2 rounded-lg transition ${
            active === "feedbacks"
              ? "bg-indigo-600 shadow-lg"
              : "hover:bg-indigo-500/20 hover:shadow-md"
          }`}
        >
          <FaChartBar size={20} /> Give Feedback
        </li>
      </ul>
    </aside>
  );
};

export default UserSideBar;
