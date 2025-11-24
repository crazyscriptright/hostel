import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/auth/user/profile?_t=${Date.now()}`,
          { 
            withCredentials: true, // This will send the HttpOnly cookies
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }
        );
        
        if (res.data.user) {
          setIsAuthenticated(true);
          // Update local storage with fresh user data
          localStorage.setItem("user_data", JSON.stringify(res.data.user));
          localStorage.setItem("shid", res.data.user.shid); // For backward compatibility
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("user_data");
          localStorage.removeItem("shid");
        }
      } catch (err) {
        // If access token expired, try to refresh
        if (err.response?.status === 401) {
          try {
            const refreshRes = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/auth/user/refresh`,
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
            
            if (refreshRes.data.status === "success") {
              setIsAuthenticated(true);
              localStorage.setItem("user_data", JSON.stringify(refreshRes.data.user));
              localStorage.setItem("shid", refreshRes.data.user.shid);
            } else {
              setIsAuthenticated(false);
              localStorage.removeItem("user_data");
              localStorage.removeItem("shid");
            }
          } catch (refreshErr) {
            setIsAuthenticated(false);
            localStorage.removeItem("user_data");
            localStorage.removeItem("shid");
          }
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("user_data");
          localStorage.removeItem("shid");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [location.pathname]); // Re-check authentication when location changes

  if (isLoading) return <div className="text-center p-5">Checking user session...</div>;

  return isAuthenticated ? children : <Navigate to="/register" replace />;
};

export default ProtectedRoute;
