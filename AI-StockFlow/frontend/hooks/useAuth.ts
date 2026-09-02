"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login as loginUser } from "@/services/authService";

type AuthUser = {
  id?: number | string;
  email?: string;
  username?: string;
  name?: string;
  role?: string;
  tenant_id?: number | string;
  [key: string]: unknown;
};

export function useAuth() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginUser(email, password);

      setIsAuthenticated(true);

      return data;
    },
    []
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem("sf_access");
    sessionStorage.removeItem("sf_refresh");

    setUser(null);
    setIsAuthenticated(false);

    router.push("/auth");
  }, [router]);

  useEffect(() => {
    const token = sessionStorage.getItem("sf_access");

    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    setLoading(false);
  }, []);

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };
}