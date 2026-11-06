import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "MedSync — Longitudinal Health Intelligence & Emergency Dispatch",
  description: "AI-assisted clinical extraction, OCR, longitudinal timelines and emergency profiles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="antialiased bg-[#070A10] text-slate-100 min-h-screen flex flex-col selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
