"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function setTokenCookie(token: string) {
  if (typeof document !== "undefined") {
    document.cookie = `medsync_token=${token}; path=/; max-age=604800; SameSite=Lax`;
  }
}

function removeTokenCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "medsync_token=; path=/; max-age=0; SameSite=Lax";
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem("medsync_token");
      if (token) {
        try {
          setTokenCookie(token);
          const me = await api.auth.me();
          setUser(me);
        } catch (e) {
          localStorage.removeItem("medsync_token");
          removeTokenCookie();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      localStorage.setItem("medsync_token", res.access_token);
      setTokenCookie(res.access_token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role = "patient") => {
    setLoading(true);
    try {
      const res = await api.auth.register(email, password, name, role);
      localStorage.setItem("medsync_token", res.access_token);
      setTokenCookie(res.access_token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("medsync_token");
    removeTokenCookie();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
