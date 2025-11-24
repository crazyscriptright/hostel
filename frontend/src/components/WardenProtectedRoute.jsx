import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

const WardenProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkWarden = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/auth/warden/profile`,
          { 
            withCredentials: true // This will send the HttpOnly cookies
          }
        );
        
        if (res.data.warden) {
          setIsAuthenticated(true);
          // Update local storage with fresh warden data
          localStorage.setItem("warden_data", JSON.stringify(res.data.warden));
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("warden_data");
        }
      } catch (err) {
        // If access token expired, try to refresh
        if (err.response?.status === 401) {
          try {
            const refreshRes = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/auth/warden/refresh`,
              {},
              { withCredentials: true }
            );
            
            if (refreshRes.data.status === "success") {
              setIsAuthenticated(true);
              localStorage.setItem("warden_data", JSON.stringify(refreshRes.data.warden));
            } else {
              setIsAuthenticated(false);
              localStorage.removeItem("warden_data");
            }
          } catch (refreshErr) {
            setIsAuthenticated(false);
            localStorage.removeItem("warden_data");
          }
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("warden_data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkWarden();
  }, []);

  if (isLoading) return <div className="text-center p-5">Checking warden session...</div>;

  return isAuthenticated ? children : <Navigate to="/warden/login" />;
};

export default WardenProtectedRoute;
