"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("owner@irobox.in");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await login(email.trim(), password);

      // Store authentication data in localStorage
      localStorage.setItem("access_token", data.access_token);

      if (data.refresh_token) {
        localStorage.setItem(
          "refresh_token",
          data.refresh_token
        );
      }

      if (data.user_id !== undefined) {
        localStorage.setItem(
          "user_id",
          String(data.user_id)
        );
      }

      if (data.tenant_id !== undefined) {
        localStorage.setItem(
          "tenant_id",
          String(data.tenant_id)
        );
      }

      if (data.role) {
        localStorage.setItem("role", data.role);
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed. Please check the backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-blue-600">
            AI StockFlow
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            AI Inventory Management Platform
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Sign in
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Use your work email to continue.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          AI StockFlow • Secure Business Management
        </p>

      </div>
    </main>
  );
}