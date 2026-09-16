"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  useAuth,
} from "@/hooks/useAuth";

export default function AuthPage() {
  const router = useRouter();

  const {
    login,
    mfaRequired,
    verifyMfaCode,
    cancelMfa,
  } = useAuth();

  const [email, setEmail] =
    useState("owner@irobox.in");

  const [password, setPassword] =
    useState("");

  const [code, setCode] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (
      !email.trim() ||
      !password.trim()
    ) {
      setError(
        "Please enter email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const result = await login(
        email.trim(),
        password
      );

      if (result.mfaRequired) {
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Invalid email or password."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    const cleanCode =
      code.replace(/\D/g, "");

    if (cleanCode.length !== 6) {
      setError(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    try {
      setLoading(true);

      await verifyMfaCode(cleanCode);

      router.push("/dashboard");
    } catch (err) {
      console.error(
        "MFA VERIFICATION ERROR:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Verification failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (
    value: string
  ) => {
    const numbersOnly =
      value
        .replace(/\D/g, "")
        .slice(0, 6);

    setCode(numbersOnly);

    if (error) {
      setError("");
    }
  };

  const handleBack = () => {
    cancelMfa();
    setCode("");
    setError("");
  };

  /*
   * MFA verification screen
   */
  if (mfaRequired) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              <svg
                className="h-7 w-7 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <rect
                  x="5"
                  y="11"
                  width="14"
                  height="10"
                  rx="2"
                />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                <path d="M12 15v3" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Verify your identity
            </h1>

            <p className="mt-2 text-sm leading-5 text-slate-500">
              Enter the 6-digit security code
              from your authenticator app.
            </p>
          </div>

          <form
            onSubmit={handleMfaSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="mfa-code"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Verification code
              </label>

              <input
                id="mfa-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) =>
                  handleCodeChange(
                    event.target.value
                  )
                }
                placeholder="000000"
                maxLength={6}
                autoFocus
                className="w-full rounded-lg border border-slate-300 px-4 py-4 text-center text-2xl font-semibold tracking-[0.5em] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                code.length !== 6
              }
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Verifying..."
                : "Verify & Continue"}
            </button>

            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Back to Sign In
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-slate-50 px-4 py-3">
            <p className="text-center text-xs leading-5 text-slate-500">
              Your verification code is
              generated by your authenticator
              application.
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            AI StockFlow • Secure Business
            Management
          </p>
        </div>
      </main>
    );
  }

  /*
   * Normal login screen
   */
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            AI-StockFlow
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to your account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="Enter your email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <rect
              x="5"
              y="11"
              width="14"
              height="10"
              rx="2"
            />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>

          <span>
            Protected with secure authentication
          </span>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          AI StockFlow • Secure Business
          Management
        </p>
      </div>
    </main>
  );
}