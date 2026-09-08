"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const publicRoutes = ["/login"];

  const isPublicRoute =
    publicRoutes.includes(pathname);

  useEffect(() => {
    // Login page must always be accessible.
    if (isPublicRoute) {
      setIsAuthenticated(true);
      setCheckingAuth(false);
      return;
    }

    // Check the authentication token directly.
    const token =
      sessionStorage.getItem("sf_access");

    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.replace("/login");
    }

    setCheckingAuth(false);
  }, [isPublicRoute, pathname, router]);

  // Don't block the login page.
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Wait while authentication is being checked.
  if (checkingAuth) {
    return null;
  }

  // Don't render protected pages without authentication.
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}