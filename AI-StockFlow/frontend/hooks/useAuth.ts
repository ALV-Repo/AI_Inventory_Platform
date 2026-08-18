"use client";

import { useEffect, useState } from "react";

const BASE_URL = "http://127.0.0.1:8000/api/v1";

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  permissions: string[];
  tenant?: {
    id: number;
    name: string;
    plan: string;
    feature_flags?: {
      ai_copilot?: boolean;
      ai_forecast?: boolean;
      ai_dead_stock?: boolean;
    };
  };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          setUser(null);
          return;
        }

        const response = await fetch(`${BASE_URL}/auth/me`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user_id");
          localStorage.removeItem("tenant_id");
          localStorage.removeItem("role");

          setUser(null);
          return;
        }

        const data: AuthUser = await response.json();

        setUser(data);
      } catch (error) {
        console.error("AUTH CHECK ERROR:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("tenant_id");
    localStorage.removeItem("role");

    setUser(null);

    window.location.href = "/login";
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  };
}