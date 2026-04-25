import { createContext, useEffect, useState } from "react";
import axiosConfig, { setAccessToken } from "../util/axiosConfig.js";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const savedUser = JSON.parse(localStorage.getItem("user") || "null");
  const [user, setUser] = useState(savedUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const response = await axiosConfig.post(API_ENDPOINTS.REFRESH);
        const { token, userId, email } = response.data || {};

        if (!token || !email) {
          throw new Error("Missing session payload");
        }

        setAccessToken(token);
        setIsAuthenticated(true);

        const currentSavedUser = JSON.parse(localStorage.getItem("user") || "null");
        const hydratedUser =
          currentSavedUser?.email === email
            ? { ...currentSavedUser, userId }
            : {
                userId,
                fullName: email.split("@")?.[0] || "User",
                email,
                profileImageUrl: null,
              };

        setUser(hydratedUser);
        localStorage.setItem("user", JSON.stringify(hydratedUser));
      } catch (_) {
        setAccessToken(null);
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setIsAuthLoading(false);
      }
    };

    bootstrapSession();
  }, []);

  const setAuthSession = ({ token, userData }) => {
    setAccessToken(token);
    setIsAuthenticated(Boolean(token));
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const clearUser = () => {
    setAccessToken(null);
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("user");
  };

  const contextValue = {
    user,
    setUser,
    setAuthSession,
    clearUser,
    isAuthenticated,
    isAuthLoading,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
