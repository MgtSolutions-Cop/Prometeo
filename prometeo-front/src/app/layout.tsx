// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Prometeo",
  description: "Simplifica · Organiza · Optimiza",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-prometeo-black text-white font-sans">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: "14px",
            },
            classNames: {
              success: "border-l-4 border-l-green-500",
              error:   "border-l-4 border-l-red-500",
              warning: "border-l-4 border-l-yellow-500",
              info:    "border-l-4 border-l-blue-500",
            },
          }}
          richColors
        />
      </body>
    </html>
  );
}