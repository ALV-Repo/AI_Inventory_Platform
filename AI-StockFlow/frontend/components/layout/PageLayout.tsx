"use client";

import React from "react";
import Sidebar from "./Sidebar";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="min-h-screen ml-44">
        {children}
      </main>
    </div>
  );
}