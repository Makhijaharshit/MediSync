"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Clock,
  ShieldAlert,
  Stethoscope,
  Ambulance,
  History,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  HeartPulse
} from "lucide-react";
import { SidebarItem } from "@/components/ui/SidebarItem";

export const AppSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["patient", "doctor", "paramedic", "admin"],
    },
    {
      label: "Documents",
      href: "/documents",
      icon: FileText,
      badge: "OCR",
      roles: ["patient", "doctor", "admin"],
    },
    {
      label: "Timeline",
      href: "/timeline",
      icon: Clock,
      roles: ["patient", "doctor", "admin"],
    },
    {
      label: "Emergency & SOS",
      href: "/emergency",
      icon: ShieldAlert,
      badge: "Critical",
      roles: ["patient", "doctor", "paramedic", "admin"],
    },
    {
      label: "Doctor Portal",
      href: "/doctor",
      icon: Stethoscope,
      roles: ["doctor", "admin"],
    },
    {
      label: "Paramedic Dispatch",
      href: "/paramedic",
      icon: Ambulance,
      badge: "Live",
      roles: ["paramedic", "admin"],
    },
    {
      label: "Audit Trail",
      href: "/audit",
      icon: History,
      roles: ["admin", "doctor"],
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ["patient", "doctor", "paramedic", "admin"],
    },
  ];

  const visibleItems = navItems.filter(
    (item) => !user || item.roles.includes(user.role)
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex flex-col justify-between shrink-0 border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl transition-all duration-300 z-30 sticky top-16 h-[calc(100vh-4rem)] ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="p-3.5 space-y-6 overflow-y-auto">
          {/* Section title / collapse button */}
          <div className="flex items-center justify-between px-2">
            {!collapsed && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Navigation
              </span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition-colors ml-auto"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {visibleItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <SidebarItem
                  key={item.href}
                  label={item.label}
                  href={item.href}
                  icon={item.icon}
                  badge={item.badge}
                  isActive={isActive}
                  isCollapsed={collapsed}
                />
              );
            })}
          </nav>
        </div>

        {/* Footer info box */}
        {!collapsed && (
          <div className="p-4 border-t border-slate-900 space-y-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-950/30 to-indigo-950/30 border border-blue-900/40">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-300 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>OCR Clinical Engine</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Zero-hallucination extraction with 300 DPI optical scanning.
              </p>
            </div>
            <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
              <span>MedSync v2.4</span>
              <span className="text-emerald-400 font-bold">● Protected</span>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080C14]/95 border-t border-white/[0.08] backdrop-blur-2xl px-2 py-1.5 flex items-center justify-around safe-bottom">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold ${
            pathname === "/dashboard"
              ? "text-blue-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <Link
          href="/documents"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold ${
            pathname.startsWith("/documents")
              ? "text-blue-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Records</span>
        </Link>

        {/* Center SOS Highlight Button */}
        <Link
          href="/emergency"
          className="flex flex-col items-center justify-center -mt-5"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-700 to-red-500 text-white flex items-center justify-center shadow-glow-rose border-2 border-slate-950">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-rose-400 mt-1">SOS</span>
        </Link>

        <Link
          href="/timeline"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold ${
            pathname.startsWith("/timeline")
              ? "text-blue-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Timeline</span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold text-slate-400 hover:text-slate-200"
        >
          <Menu className="w-4 h-4" />
          <span>More</span>
        </button>
      </div>

      {/* Mobile Drawer Menu for other routes */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-4/5 max-w-sm h-full bg-slate-950 border-l border-slate-800 p-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-blue-500" />
                    <span className="font-bold text-white text-base">MedSync Navigation</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold ${
                          isActive
                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                            : "text-slate-300 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-900 text-xs text-slate-500">
                Logged in as <span className="font-bold text-white">{user?.full_name}</span> ({user?.role})
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
