"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [mfa, setMfa] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            onClick={() => alert("Settings saved successfully")}
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

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                defaultValue="Admin User"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                defaultValue="admin@aistockflow.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

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

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone Number
              </label>

              <input
                type="text"
                defaultValue="+91 98765 43210"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
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
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <h3 className="font-medium text-gray-900">
                  Notifications
                </h3>

                <p className="text-sm text-gray-500">
                  Receive application notifications
                </p>
              </div>

              <button
                type="button"
                onClick={() => setNotifications(!notifications)}
                className={`relative h-6 w-11 rounded-full transition ${
                  notifications ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    notifications ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Email Alerts */}
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <h3 className="font-medium text-gray-900">
                  Email Alerts
                </h3>

                <p className="text-sm text-gray-500">
                  Receive important alerts by email
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`relative h-6 w-11 rounded-full transition ${
                  emailAlerts ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    emailAlerts ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <h3 className="font-medium text-gray-900">
                  Dark Mode
                </h3>

                <p className="text-sm text-gray-500">
                  Use dark theme for the application
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`relative h-6 w-11 rounded-full transition ${
                  darkMode ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    darkMode ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* MFA */}
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <h3 className="font-medium text-gray-900">
                  Multi-Factor Authentication
                </h3>

                <p className="text-sm text-gray-500">
                  Add an extra layer of security to your account
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMfa(!mfa)}
                className={`relative h-6 w-11 rounded-full transition ${
                  mfa ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    mfa ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

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
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
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
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}