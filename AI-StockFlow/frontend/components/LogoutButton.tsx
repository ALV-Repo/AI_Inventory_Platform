"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    router.replace("/auth");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
}