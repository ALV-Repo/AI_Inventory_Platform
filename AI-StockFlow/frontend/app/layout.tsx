import "./globals.css";
import type { Metadata } from "next";
import AuthGuard from "../components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "AI StockFlow",
  description: "AI Inventory Management Platform",
};

const themeScript = `
(function () {
  try {
    const savedTheme = localStorage.getItem("stockflow-dark-mode");
    const root = document.documentElement;

    if (savedTheme === "true") {
      root.classList.add("dark");
      root.classList.add("stockflow-dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.classList.remove("stockflow-dark");
      root.style.colorScheme = "light";
    }
  } catch (error) {
    console.error("Theme initialization failed:", error);
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
