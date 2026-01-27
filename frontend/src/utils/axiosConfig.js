// src/utils/axiosConfig.js - Production Subdomain Support
import axios from "axios";
import { debugCookieEnvironment } from "./cookieUtils.js";

// Production subdomain API detection
const getApiBaseUrl = () => {
  // Check if we're in production (govthostelcare.me domain)
  const hostname = window.location.hostname;
  const isProduction = hostname.includes("govthostelcare.me");

  if (isProduction) {
    // Production: Use api.govthostelcare.me subdomain
    return "https://api.govthostelcare.me";
  } else {
    // Development: Use environment variable or fallback
    return import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  }
};

const API_BASE_URL = getApiBaseUrl();

// Environment detection for debugging
if (window.location.hostname.includes("govthostelcare.me")) {
  debugCookieEnvironment();
} else {
}

// In-memory token storage
let adminTokens = {
  access_token: null,
  refresh_token: null,
};

let wardenTokens = {
  access_token: null,
  refresh_token: null,
};

let userTokens = {
  access_token: null,
  refresh_token: null,
};

// Create axios instance for admin requests with production subdomain support
export const adminAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Ensures cookies are sent with every request
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Create axios instance for warden requests with production subdomain support
export const wardenAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Ensures cookies are sent with every request
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Create axios instance for user requests with production subdomain support
export const userAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Ensures cookies are sent with every request
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Token management functions with production debugging
export const setAdminTokens = (tokens) => {
  adminTokens.access_token = tokens.access_token;
  adminTokens.refresh_token = tokens.refresh_token;
  if (window.location.hostname.includes("govthostelcare.me")) {
  }
};

export const setWardenTokens = (tokens) => {
  wardenTokens.access_token = tokens.access_token;
  wardenTokens.refresh_token = tokens.refresh_token;
  if (window.location.hostname.includes("govthostelcare.me")) {
  }
};

export const setUserTokens = (tokens) => {
  userTokens.access_token = tokens.access_token;
  userTokens.refresh_token = tokens.refresh_token;
  if (window.location.hostname.includes("govthostelcare.me")) {
  }
};

export const clearAdminTokens = () => {
  adminTokens.access_token = null;
  adminTokens.refresh_token = null;
  if (window.location.hostname.includes("govthostelcare.me")) {
  }
};

export const clearWardenTokens = () => {
  wardenTokens.access_token = null;
  wardenTokens.refresh_token = null;
  if (window.location.hostname.includes("govthostelcare.me")) {
  }
};

export const clearUserTokens = () => {
  userTokens.access_token = null;
  userTokens.refresh_token = null;
  if (window.location.hostname.includes("govthostelcare.me")) {
  }
};

// Add request interceptor to admin axios to include Authorization header
adminAxios.interceptors.request.use(
  (config) => {
    if (adminTokens.access_token) {
      config.headers.Authorization = `Bearer ${adminTokens.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add request interceptor to warden axios to include Authorization header
wardenAxios.interceptors.request.use(
  (config) => {
    if (wardenTokens.access_token) {
      config.headers.Authorization = `Bearer ${wardenTokens.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add request interceptor to user axios to include Authorization header
userAxios.interceptors.request.use(
  (config) => {
    if (userTokens.access_token) {
      config.headers.Authorization = `Bearer ${userTokens.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor to handle admin token expiration and refresh
adminAxios.interceptors.response.use(
  (response) => {
    // Check if the response contains new tokens (from login response)
    if (response.data.access_token && response.data.refresh_token) {
      setAdminTokens({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 and haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/admin/refresh`,
          {},
          { withCredentials: true },
        );

        if (refreshResponse.data.status === "success") {
          // Update tokens if provided in refresh response
          if (refreshResponse.data.access_token) {
            setAdminTokens({
              access_token: refreshResponse.data.access_token,
              refresh_token:
                refreshResponse.data.refresh_token || adminTokens.refresh_token,
            });
          }
          // Retry the original request
          return adminAxios(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        clearAdminTokens();
        localStorage.removeItem("admin_data");

        // Production-aware redirect
        const isProduction =
          window.location.hostname.includes("govthostelcare.me");
        const loginUrl = isProduction
          ? "https://admin.govthostelcare.me/login"
          : "/admin/login";
        window.location.href = loginUrl;

        return Promise.reject(refreshError);
      }
    }

    // If refresh also failed or other error, redirect to login
    if (error.response?.status === 401) {
      clearAdminTokens();
      localStorage.removeItem("admin_data");

      // Production-aware redirect
      const isProduction =
        window.location.hostname.includes("govthostelcare.me");
      const loginUrl = isProduction
        ? "https://admin.govthostelcare.me/login"
        : "/admin/login";
      window.location.href = loginUrl;
    }

    return Promise.reject(error);
  },
);

// Add response interceptor to handle warden token expiration and refresh
wardenAxios.interceptors.response.use(
  (response) => {
    // Check if the response contains new tokens (from login response)
    if (response.data.access_token && response.data.refresh_token) {
      setWardenTokens({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 and haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/warden/refresh`,
          {},
          { withCredentials: true },
        );

        if (refreshResponse.data.status === "success") {
          // Update tokens if provided in refresh response
          if (refreshResponse.data.access_token) {
            setWardenTokens({
              access_token: refreshResponse.data.access_token,
              refresh_token:
                refreshResponse.data.refresh_token ||
                wardenTokens.refresh_token,
            });
          }
          // Retry the original request
          return wardenAxios(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        clearWardenTokens();
        localStorage.removeItem("warden");

        // Production-aware redirect
        const isProduction =
          window.location.hostname.includes("govthostelcare.me");
        const loginUrl = isProduction
          ? "https://warden.govthostelcare.me/login"
          : "/warden/login";
        window.location.href = loginUrl;

        return Promise.reject(refreshError);
      }
    }

    // If refresh also failed or other error, redirect to login
    if (error.response?.status === 401) {
      clearWardenTokens();
      localStorage.removeItem("warden");

      // Production-aware redirect
      const isProduction =
        window.location.hostname.includes("govthostelcare.me");
      const loginUrl = isProduction
        ? "https://warden.govthostelcare.me/login"
        : "/warden/login";
      window.location.href = loginUrl;
    }

    return Promise.reject(error);
  },
);

// Add response interceptor to handle user token expiration and refresh
userAxios.interceptors.response.use(
  (response) => {
    // Check if the response contains new tokens (from login response)
    if (response.data.access_token && response.data.refresh_token) {
      setUserTokens({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 and haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/user/refresh`,
          {},
          { withCredentials: true },
        );

        if (refreshResponse.data.status === "success") {
          // Update tokens if provided in refresh response
          if (refreshResponse.data.access_token) {
            setUserTokens({
              access_token: refreshResponse.data.access_token,
              refresh_token:
                refreshResponse.data.refresh_token || userTokens.refresh_token,
            });
          }
          // Retry the original request
          return userAxios(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        clearUserTokens();
        localStorage.removeItem("user_data");
        localStorage.removeItem("shid");

        // Production-aware redirect
        const isProduction =
          window.location.hostname.includes("govthostelcare.me");
        const loginUrl = isProduction
          ? "https://govthostelcare.me/register"
          : "/register";
        window.location.href = loginUrl;

        return Promise.reject(refreshError);
      }
    }

    // If refresh also failed or other error, redirect to login
    if (error.response?.status === 401) {
      clearUserTokens();
      localStorage.removeItem("user_data");
      localStorage.removeItem("shid");

      // Production-aware redirect
      const isProduction =
        window.location.hostname.includes("govthostelcare.me");
      const loginUrl = isProduction
        ? "https://govthostelcare.me/register"
        : "/register";
      window.location.href = loginUrl;
    }

    return Promise.reject(error);
  },
);

// Keep the default export as adminAxios for backward compatibility
export default adminAxios;
