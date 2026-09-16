"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageLayout from "../../components/layout/PageLayout";

function SettingToggle({
  title,
  description,
  enabled,
  onToggle,
  disabled = false,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-6 rounded-xl border p-5 transition ${
        enabled
          ? "border-blue-200 bg-blue-50/60 dark:border-blue-900/60 dark:bg-blue-950/30"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
      }`}
    >
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${title} ${enabled ? "enabled" : "disabled"}`}
        disabled={disabled}
        onClick={onToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
        } ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function SecurityIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <path d="M12 15v3" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export default function SettingsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [mfa, setMfa] = useState(false);

  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaMessage, setMfaMessage] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("stockflow-dark-mode");
    const savedNotifications = localStorage.getItem("stockflow-notifications");
    const savedEmailAlerts = localStorage.getItem("stockflow-email-alerts");
    const savedMfa = localStorage.getItem("stockflow-mfa-enabled");

    setDarkMode(savedDarkMode === "true");

    if (savedNotifications !== null) {
      setNotifications(savedNotifications === "true");
    }

    if (savedEmailAlerts !== null) {
      setEmailAlerts(savedEmailAlerts === "true");
    }

    if (savedMfa !== null) {
      setMfa(savedMfa === "true");
    }

    setThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (!themeLoaded) return;

    const root = document.documentElement;

    root.classList.toggle("dark", darkMode);
    root.classList.toggle("stockflow-dark", darkMode);
    root.style.colorScheme = darkMode ? "dark" : "light";

    localStorage.setItem("stockflow-dark-mode", String(darkMode));
  }, [darkMode, themeLoaded]);

  useEffect(() => {
    localStorage.setItem(
      "stockflow-notifications",
      String(notifications)
    );
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(
      "stockflow-email-alerts",
      String(emailAlerts)
    );
  }, [emailAlerts]);

  useEffect(() => {
    localStorage.setItem("stockflow-mfa-enabled", String(mfa));
  }, [mfa]);

  const handleLogout = () => {
    sessionStorage.removeItem("sf_access");
    sessionStorage.removeItem("sf_refresh");
    sessionStorage.removeItem("sf_mfa_token");
    sessionStorage.removeItem("sf_mfa_challenge");
    router.push("/login");
  };

  const handleSave = () => {
    localStorage.setItem("stockflow-dark-mode", String(darkMode));
    localStorage.setItem("stockflow-notifications", String(notifications));
    localStorage.setItem("stockflow-email-alerts", String(emailAlerts));
    localStorage.setItem("stockflow-mfa-enabled", String(mfa));

    window.alert("Settings saved successfully.");
  };

  const handleChangePassword = () => {
    window.alert(
      "Password change flow will be connected to the authentication service."
    );
  };

  const handleMfaToggle = () => {
    setMfaError("");
    setMfaMessage("");

    if (mfa) {
      const confirmed = window.confirm(
        "Are you sure you want to disable Multi-Factor Authentication?"
      );

      if (!confirmed) return;

      setMfa(false);
      setShowMfaSetup(false);
      setMfaCode("");
      setMfaMessage(
        "MFA has been disabled in the current interface. Backend confirmation is required for account-level changes."
      );
      return;
    }

    setShowMfaSetup(true);
    setMfaCode("");
    setMfaMessage("");
  };

  const handleMfaVerification = async () => {
    setMfaError("");
    setMfaMessage("");

    const cleanCode = mfaCode.replace(/\D/g, "");

    if (cleanCode.length !== 6) {
      setMfaError("Please enter a valid 6-digit verification code.");
      return;
    }

    setMfaLoading(true);

    try {
      setMfa(true);
      setShowMfaSetup(false);
      setMfaCode("");
      setMfaMessage(
        "MFA has been enabled for this interface. Connect this action to the backend MFA enrollment API for account-level protection."
      );
    } finally {
      setMfaLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                AI StockFlow
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Settings
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Manage your account, preferences, security, and application
                settings.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>

          <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Account Settings
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Manage your account information.
                </p>
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <label
                    htmlFor="account-name"
                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Account Name
                  </label>
                  <input
                    id="account-name"
                    type="text"
                    defaultValue="AI StockFlow User"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
                  />
                </div>

                <div>
                  <label
                    htmlFor="account-email"
                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Email
                  </label>
                  <input
                    id="account-email"
                    type="email"
                    defaultValue="owner@irobox.in"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
                  />
                </div>

                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-950">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Password
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Keep your account protected with a strong password.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleChangePassword}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Preferences
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Customize how AI StockFlow behaves.
                </p>
              </div>

              <div className="space-y-3 p-6">
                <SettingToggle
                  title="Notifications"
                  description="Receive important inventory and system notifications."
                  enabled={notifications}
                  onToggle={() => setNotifications((value) => !value)}
                />

                <SettingToggle
                  title="Email Alerts"
                  description="Receive important alerts and business updates by email."
                  enabled={emailAlerts}
                  onToggle={() => setEmailAlerts((value) => !value)}
                />

                <SettingToggle
                  title="Dark Mode"
                  description="Use the dark appearance throughout the application."
                  enabled={darkMode}
                  onToggle={() => setDarkMode((value) => !value)}
                />
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    <SecurityIcon />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Security
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Protect your AI StockFlow account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <SettingToggle
                  title="Multi-Factor Authentication"
                  description={
                    mfa
                      ? "MFA is enabled for this interface."
                      : "Add an extra layer of security to your account."
                  }
                  enabled={mfa}
                  onToggle={handleMfaToggle}
                />

                {showMfaSetup && !mfa && (
                  <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/70 p-5 dark:border-blue-900/60 dark:bg-blue-950/30">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400">
                        <SecurityIcon />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          Set up MFA
                        </h3>

                        <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
                          Use an authenticator app to generate a 6-digit
                          verification code.
                        </p>

                        <div className="mt-5">
                          <label
                            htmlFor="mfa-settings-code"
                            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                          >
                            Verification Code
                          </label>

                          <input
                            id="mfa-settings-code"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={mfaCode}
                            onChange={(event) =>
                              setMfaCode(
                                event.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 6)
                              )
                            }
                            placeholder="000000"
                            className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-xl font-semibold tracking-[0.4em] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
                          />
                        </div>

                        {mfaError && (
                          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/60 dark:bg-red-950/30">
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {mfaError}
                            </p>
                          </div>
                        )}

                        {mfaMessage && (
                          <div className="mt-4 rounded-lg border border-blue-200 bg-white px-4 py-3 dark:border-blue-900/60 dark:bg-slate-900">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              {mfaMessage}
                            </p>
                          </div>
                        )}

                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={handleMfaVerification}
                            disabled={mfaLoading}
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {mfaLoading ? "Verifying..." : "Verify & Enable"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowMfaSetup(false);
                              setMfaCode("");
                              setMfaError("");
                              setMfaMessage("");
                            }}
                            disabled={mfaLoading}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                  <div className="flex gap-3 text-slate-500 dark:text-slate-400">
                    <InfoIcon />
                    <p className="text-xs leading-5">
                      MFA account enrollment and verification must be connected
                      to the backend authentication service before this setting
                      can provide account-level protection.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm dark:border-red-900/60 dark:bg-slate-900">
              <div className="border-b border-red-100 px-6 py-5 dark:border-red-900/40">
                <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
                  Danger Zone
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Actions that affect your current session.
                </p>
              </div>

              <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Sign out
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    End your current AI StockFlow session.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                >
                  Sign Out
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
