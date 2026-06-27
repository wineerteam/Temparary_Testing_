import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/authApi.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-login: check session on load
  const checkSession = async () => {
    try {
      const data = await authApi.getMe();
      if (data && data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log("Session verification failed:", error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (usernameOrEmail, password) => {
    setLoading(true);
    try {
      const data = await authApi.login(usernameOrEmail, password);
      if (data && data.success) {
        setUser(data.user);
        return data;
      }
      throw new Error(data?.error || "Login failed");
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, confirmPassword) => {
    setLoading(true);
    try {
      const data = await authApi.register(username, email, password, confirmPassword);
      if (data && data.success) {
        setUser(data.user);
        return data;
      }
      throw new Error(data?.error || "Registration failed");
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  const forgotPassword = async (email) => {
    return await authApi.forgotPassword(email);
  };

  const resetPassword = async (token, password) => {
    return await authApi.resetPassword(token, password);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
