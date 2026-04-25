import axios from "axios";
import { API_ENDPOINTS, BASE_URL } from "./apiEndpoints.js";

let inMemoryAccessToken = null;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token || null;
};

export const getAccessToken = () => inMemoryAccessToken;

const axiosConfig = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const authFlowEndpoints = [
  API_ENDPOINTS.LOGIN,
  API_ENDPOINTS.REGISTER,
  API_ENDPOINTS.REFRESH,
  API_ENDPOINTS.FORGOT_PASSWORD,
  API_ENDPOINTS.RESET_PASSWORD,
  API_ENDPOINTS.VALIDATE_RESET_TOKEN,
  "/activate",
];

// List of endpoints that do not require authorization header
const excludeEndpoints = [
  ...authFlowEndpoints,
  "/status",
  "/health",
];

// Request interceptor
axiosConfig.interceptors.request.use(
  (config) => {
    const shouldSkipToken = excludeEndpoints.some((endpoint) => {
      return config.url?.includes(endpoint) 
    });

    if (!shouldSkipToken) {
      const accessToken = getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosConfig.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";

    const isAuthFlowRequest = authFlowEndpoints.some((endpoint) =>
      requestUrl.includes(endpoint)
    );

    // Attempt one token refresh on auth failures, except for login/register/refresh.
    const shouldTryRefresh =
      (status === 401 || status === 403) &&
      !originalRequest?._retry &&
      requestUrl &&
      !isAuthFlowRequest;

    if (shouldTryRefresh) {
      try {
        originalRequest._retry = true;
        const refreshResponse = await axiosConfig.post(API_ENDPOINTS.REFRESH);
        const newToken = refreshResponse?.data?.token;
        if (newToken) {
          setAccessToken(newToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return axiosConfig(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    if ((status === 401 || status === 403) && !isAuthFlowRequest) {
      setAccessToken(null);
      localStorage.removeItem("user");
      window.location.href = "/login";
    } else if (status === 500) {
      console.error("Server Error. Try again later.");
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please try again.");
    }
    return Promise.reject(error);
  }
);

export default axiosConfig;
