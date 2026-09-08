"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.removeItem("sf_access");
sessionStorage.removeItem("sf_refresh");

    router.replace("/login");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
    >
      Logout
    </button>
  );
}