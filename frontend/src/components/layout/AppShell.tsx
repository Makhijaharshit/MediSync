"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { GlassNavbar } from "@/components/ui/GlassNavbar";
import { AppSidebar } from "@/components/ui/AppSidebar";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const isLoginPage = pathname === "/login";

  if (isLandingPage || isLoginPage) {
    return <div className="min-h-screen flex flex-col">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070A10] text-slate-100">
      <GlassNavbar variant="app" />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};
