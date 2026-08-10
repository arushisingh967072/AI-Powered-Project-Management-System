import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "project_manager" | "employee";
  phone?: string;
  department?: string;
  experience?: number;
  skills?: string[];
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (email: string, name: string, googleId: string, profilePicture?: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: any) => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await API.get("/auth/me");
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } else {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await API.post("/auth/login", { email, password });
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (email: string, name: string, googleId: string, profilePicture?: string) => {
    setLoading(true);
    try {
      const response = await API.post("/auth/google", { email, name, googleId, profilePicture });
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Google auth failed");
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: any) => {
    setLoading(true);
    try {
      const response = await API.post("/auth/signup", userData);
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await API.get("/auth/logout");
    } catch (error) {
      console.error("Logout request error", error);
    } finally {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setLoading(false);
    }
  };

  const updateProfile = async (userData: any) => {
    try {
      const response = await API.put(`/employees/${user?._id}`, userData);
      if (response.data.success) {
        setUser(response.data.employee);
        localStorage.setItem("user", JSON.stringify(response.data.employee));
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Profile update failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        googleLogin,
        signup,
        logout,
        updateProfile,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
