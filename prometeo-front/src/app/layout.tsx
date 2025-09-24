// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prometeo",
  description: "Simplifica · Organiza · Optimiza",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-prometeo-black text-white font-sans">
        {children}
      </body>
    </html>
  );
}
