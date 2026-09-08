"use client";

import { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

useEffect(() => {
  const savedDarkMode =
    localStorage.getItem("stockflow-dark-mode") === "true";

  setDarkMode(savedDarkMode);

  document.documentElement.classList.toggle(
    "stockflow-dark",
    savedDarkMode
  );
}, []);

const handleDarkModeToggle = () => {
  const nextDarkMode = !darkMode;

  setDarkMode(nextDarkMode);

  localStorage.setItem(
    "stockflow-dark-mode",
    String(nextDarkMode)
  );

  document.documentElement.classList.toggle(
    "stockflow-dark",
    nextDarkMode
  );
};
  const [mfa, setMfa] = useState(false);

  const handleLogout = () => {
  localStorage.removeItem("access_token");
localStorage.removeItem("refresh_token");

    window.location.href = "/login";
  };

  const handleSave = () => {
    alert("Settings saved successfully");
  };

  const handleChangePassword = () => {
    alert("Password change feature will be available soon.");
  };

  return (
    <PageLayout>
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Settings
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage your account and application preferences
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>

          {/* Account Settings */}
          <div className="mb-6 rounded-xl border bg-white shadow-sm">

            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Account Settings
              </h2>

              <p className="text-sm text-gray-500">
                Manage your personal account information
              </p>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">

              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  defaultValue="Admin User"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  defaultValue="admin@aistockflow.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                />
              </div>

              {/* Role */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Role
                </label>

                <input
                  type="text"
                  value="Administrator"
                  disabled
                  readOnly
                  className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>

                <input
                  type="text"
                  defaultValue="+91 98765 43210"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                />
              </div>

            </div>
          </div>

          {/* Preferences */}
          <div className="mb-6 rounded-xl border bg-white shadow-sm">

            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Preferences
              </h2>

              <p className="text-sm text-gray-500">
                Customize your StockFlow experience
              </p>
            </div>

            <div className="divide-y">

              {/* Notifications */}
              <SettingToggle
                title="Notifications"
                description="Receive application notifications"
                enabled={notifications}
                onToggle={() =>
                  setNotifications(!notifications)
                }
              />

              {/* Email Alerts */}
              <SettingToggle
                title="Email Alerts"
                description="Receive important alerts by email"
                enabled={emailAlerts}
                onToggle={() =>
                  setEmailAlerts(!emailAlerts)
                }
              />

              {/* Dark Mode */}
              <SettingToggle
                title="Dark Mode"
                description="Use dark theme for the application"
                enabled={darkMode}
                onToggle={handleDarkModeToggle}
              />

              {/* MFA */}
              <SettingToggle
                title="Multi-Factor Authentication"
                description="Add an extra layer of security to your account"
                enabled={mfa}
                onToggle={() => setMfa(!mfa)}
              />

            </div>
          </div>

          {/* Security */}
          <div className="mb-6 rounded-xl border bg-white shadow-sm">

            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Security
              </h2>

              <p className="text-sm text-gray-500">
                Manage account security
              </p>
            </div>

            <div className="flex items-center justify-between px-6 py-5">

              <div>
                <h3 className="font-medium text-gray-900">
                  Change Password
                </h3>

                <p className="text-sm text-gray-500">
                  Update your account password
                </p>
              </div>

              <button
                type="button"
                onClick={handleChangePassword}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Change Password
              </button>

            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-red-200 bg-white shadow-sm">

            <div className="border-b border-red-100 px-6 py-4">

              <h2 className="text-lg font-semibold text-red-600">
                Danger Zone
              </h2>

              <p className="text-sm text-gray-500">
                Irreversible account actions
              </p>

            </div>

            <div className="flex items-center justify-between px-6 py-5">

              <div>
                <h3 className="font-medium text-gray-900">
                  Sign Out
                </h3>

                <p className="text-sm text-gray-500">
                  Sign out from the current session
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Sign Out
              </button>

            </div>
          </div>

          {/* Footer */}
          <div className="py-8 text-center text-xs text-gray-400">
            AI StockFlow • Application Settings
          </div>

        </div>
      </main>
    </PageLayout>
  );
}

/* ============================================================
   SETTING TOGGLE
============================================================ */

function SettingToggle({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-5">

      <div>
        <h3 className="font-medium text-gray-900">
          {title}
        </h3>

        <p className="text-sm text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        aria-label={`Toggle ${title}`}
        aria-pressed={enabled}
        onClick={onToggle}
        className={`relative h-6 w-11 rounded-full transition ${
          enabled
            ? "bg-blue-600"
            : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>

    </div>
  );
}