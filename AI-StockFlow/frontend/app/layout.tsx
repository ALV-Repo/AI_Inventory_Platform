import "./globals.css";
import type { Metadata } from "next";
import AuthGuard from "../components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "AI StockFlow",
  description: "AI Inventory Management Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}