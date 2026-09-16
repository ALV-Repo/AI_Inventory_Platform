"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearAuthTokens,
  getAccessToken,
  login as loginUser,
  verifyMfa,
  type LoginResponse,
  type MfaVerificationResponse,
} from "@/services/authService";

type AuthUser = {
  id?: number | string;
  email?: string;
  username?: string;
  name?: string;
  role?: string;
  tenant_id?: number | string;
  [key: string]: unknown;
};

type LoginResult =
  | {
      mfaRequired: false;
      data: LoginResponse;
    }
  | {
      mfaRequired: true;
      data: LoginResponse;
      mfaToken?: string;
      challengeToken?: string;
    };

export function useAuth() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [mfaRequired, setMfaRequired] =
    useState(false);

  const [mfaToken, setMfaToken] =
    useState<string | undefined>(undefined);

  const [challengeToken, setChallengeToken] =
    useState<string | undefined>(undefined);

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<LoginResult> => {
      const data = await loginUser(
        email,
        password
      );

      const requiresMfa =
        data.mfa_required === true ||
        data.requires_mfa === true;

      if (requiresMfa) {
        setMfaRequired(true);
        setIsAuthenticated(false);

        setMfaToken(
          typeof data.mfa_token === "string"
            ? data.mfa_token
            : undefined
        );

        setChallengeToken(
          typeof data.challenge_token === "string"
            ? data.challenge_token
            : undefined
        );

        return {
          mfaRequired: true,
          data,
          mfaToken:
            typeof data.mfa_token === "string"
              ? data.mfa_token
              : undefined,
          challengeToken:
            typeof data.challenge_token ===
            "string"
              ? data.challenge_token
              : undefined,
        };
      }

      setMfaRequired(false);
      setMfaToken(undefined);
      setChallengeToken(undefined);
      setIsAuthenticated(true);

      if (data.user_id !== undefined) {
        setUser({
          id: data.user_id,
          tenant_id: data.tenant_id,
          name: data.full_name,
          role: data.role,
          email,
        });
      }

      return {
        mfaRequired: false,
        data,
      };
    },
    []
  );

  const verifyMfaCode = useCallback(
    async (
      code: string
    ): Promise<MfaVerificationResponse> => {
      if (!code.trim()) {
        throw new Error(
          "Please enter the verification code."
        );
      }

      if (!/^\d{6}$/.test(code.trim())) {
        throw new Error(
          "Please enter a valid 6-digit verification code."
        );
      }

      const data = await verifyMfa(
        code.trim(),
        mfaToken ?? challengeToken
      );

      setMfaRequired(false);
      setMfaToken(undefined);
      setChallengeToken(undefined);
      setIsAuthenticated(true);

      if (data.user_id !== undefined) {
        setUser({
          id: data.user_id,
          tenant_id: data.tenant_id,
          name: data.full_name,
          role: data.role,
        });
      }

      return data;
    },
    [mfaToken, challengeToken]
  );

  const cancelMfa = useCallback(() => {
    clearAuthTokens();

    setMfaRequired(false);
    setMfaToken(undefined);
    setChallengeToken(undefined);
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    clearAuthTokens();

    setUser(null);
    setIsAuthenticated(false);
    setMfaRequired(false);
    setMfaToken(undefined);
    setChallengeToken(undefined);

    router.push("/auth");
  }, [router]);

  useEffect(() => {
    const token = getAccessToken();

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

    mfaRequired,
    mfaToken,
    challengeToken,

    verifyMfaCode,
    cancelMfa,

    logout,
  };
}