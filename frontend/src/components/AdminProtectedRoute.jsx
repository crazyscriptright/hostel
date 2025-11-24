import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/admin/profile`,
          { 
            withCredentials: true // This will send the HttpOnly cookies
          }
        );
        
        if (res.data.admin) {
          setIsAuthenticated(true);
          // Update local storage with fresh admin data
          localStorage.setItem("admin_data", JSON.stringify(res.data.admin));
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("admin_data");
        }
      } catch (err) {
        // If access token expired, try to refresh
        if (err.response?.status === 401) {
          try {
            const refreshRes = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/auth/admin/refresh`,
              {},
              { withCredentials: true }
            );
            
            if (refreshRes.data.status === "success") {
              setIsAuthenticated(true);
              localStorage.setItem("admin_data", JSON.stringify(refreshRes.data.admin));
            } else {
              setIsAuthenticated(false);
              localStorage.removeItem("admin_data");
            }
          } catch (refreshErr) {
            setIsAuthenticated(false);
            localStorage.removeItem("admin_data");
          }
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("admin_data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (isLoading) return <div className="text-center p-5">Checking admin session...</div>;

  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

export default AdminProtectedRoute;
