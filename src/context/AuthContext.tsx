"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SafeUser } from "@/types";

interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: SafeUser }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (firebaseUser: any) => Promise<{ success: boolean; error?: string; user?: SafeUser }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          try {
            localStorage.setItem("chaitanya_auth_user", JSON.stringify(data.user));
          } catch (e) {}
        } else {
          setUser(null);
          try {
            localStorage.removeItem("chaitanya_auth_user");
            localStorage.removeItem("freshmart_auth_user");
          } catch (e) {}
        }
      }
    } catch (err) {
      // Keep cached user on temporary network drop
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Immediately read cached user on client mount
    try {
      const cached = localStorage.getItem("chaitanya_auth_user") || localStorage.getItem("freshmart_auth_user");
      if (cached) {
        const parsed = JSON.parse(cached);
        setUser(parsed);
        setIsLoading(false);
      }
    } catch (e) {}

    // 2. Validate session in background
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to login" };
      }

      setUser(data.user);
      try {
        localStorage.setItem("chaitanya_auth_user", JSON.stringify(data.user));
      } catch (e) {}
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const loginWithGoogle = async (firebaseUser: any) => {
    try {
      const res = await fetch("/api/auth/firebase-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          phone: firebaseUser.phoneNumber,
          uid: firebaseUser.uid,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to sync user" };
      }

      setUser(data.user);
      try {
        localStorage.setItem("chaitanya_auth_user", JSON.stringify(data.user));
      } catch (e) {}
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }

      setUser(data.user);
      try {
        localStorage.setItem("chaitanya_auth_user", JSON.stringify(data.user));
      } catch (e) {}
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      try {
        localStorage.removeItem("chaitanya_auth_user");
        localStorage.removeItem("freshmart_auth_user");
      } catch (e) {}
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const isAdmin = user?.role === "ADMIN" || user?.role === "STAFF";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
