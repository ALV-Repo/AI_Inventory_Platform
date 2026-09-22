"use client";
import { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [mfa, setMfa] = useState(false);
  useEffect(() => {
    const saved = sessionStorage.getItem("stockflow-dark-mode") === "true";
    setDarkMode(saved);
    document.documentElement.classList.toggle("stockflow-dark", saved);
  }, []);
  const handleDarkModeToggle = () => {
    const next = !darkMode;
    setDarkMode(next);
    sessionStorage.setItem("stockflow-dark-mode", String(next));
    document.documentElement.classList.toggle("stockflow-dark", next);
  };
  const handleLogout = () => {
    sessionStorage.removeItem("sf_access");
    sessionStorage.removeItem("sf_refresh");
    window.location.href = "/login";
  };
  return (
    <PageLayout>
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8"><h1 className="text-2xl font-bold text-gray-900">Settings</h1><p className="mt-1 text-sm text-gray-500">Manage account preferences</p></div>
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Notifications</h2>
              {[{label:"Push Notifications",sub:"Stock alerts and sales",state:notifications,setter:setNotifications},{label:"Email Alerts",sub:"Daily summary emails",state:emailAlerts,setter:setEmailAlerts}].map(({label,sub,state,setter})=>(
                <div key={label} className="flex items-center justify-between mb-4">
                  <div><p className="text-sm font-medium text-gray-900">{label}</p><p className="text-xs text-gray-500">{sub}</p></div>
                  <button onClick={()=>setter(!state)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${state?"bg-blue-600":"bg-gray-200"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${state?"translate-x-6":"translate-x-1"}`}/>
                  </button>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Appearance</h2>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium text-gray-900">Dark Mode</p><p className="text-xs text-gray-500">Switch theme</p></div>
                <button onClick={handleDarkModeToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${darkMode?"bg-blue-600":"bg-gray-200"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${darkMode?"translate-x-6":"translate-x-1"}`}/>
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Security</h2>
              <div className="flex items-center justify-between mb-4">
                <div><p className="text-sm font-medium text-gray-900">Multi-Factor Authentication</p><p className="text-xs text-gray-500">Adds extra security layer</p></div>
                <button onClick={()=>setMfa(!mfa)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${mfa?"bg-blue-600":"bg-gray-200"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${mfa?"translate-x-6":"translate-x-1"}`}/>
                </button>
              </div>
            </div>
            <button onClick={handleLogout} className="rounded-lg border border-red-200 bg-red-50 px-6 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100">Sign Out</button>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
