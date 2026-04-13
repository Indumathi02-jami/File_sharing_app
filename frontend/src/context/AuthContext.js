import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("smartshare_token"));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get("/api/auth/me");
        setUser(response.data.user);
      } catch (_error) {
        localStorage.removeItem("smartshare_token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const saveSession = ({ token: nextToken, user: nextUser }) => {
    localStorage.setItem("smartshare_token", nextToken);
    setToken(nextToken);
    setUser(nextUser);
  };

  const signup = async (payload) => {
    const response = await api.post("/api/auth/signup", payload);
    saveSession(response.data);
    toast.success("Account created successfully.");
  };

  const login = async (payload) => {
    const response = await api.post("/api/auth/login", payload);
    saveSession(response.data);
    toast.success("Welcome back.");
  };

  const logout = () => {
    localStorage.removeItem("smartshare_token");
    setToken(null);
    setUser(null);
    toast.info("You have been logged out.");
  };

  const value = {
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    logout,
    signup,
    user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
