"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  HeartPulse,
  LogOut,
  User as UserIcon,
  Shield,
  Settings,
  ArrowRight,
  Sparkles,
  Menu,
  X
} from "lucide-react";
import { SOSButton } from "@/components/ui/SOSButton";

interface GlassNavbarProps {
  variant?: "public" | "app";
}

export const GlassNavbar: React.FC<GlassNavbarProps> = ({ variant }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If variant is not explicitly provided, infer from pathname
  const isPublic = variant ? variant === "public" : pathname === "/";

  if (isPublic) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-[#080B11]/75 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-sm ring-1 ring-white/20 group-hover:scale-105 transition-all">
              <HeartPulse className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-semibold tracking-tight text-white font-sans">
                MedSync
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase text-blue-400 font-medium px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                OS
              </span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              Platform
            </a>
            <a href="#preview" className="hover:text-white transition-colors">
              Interface
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              Pipeline
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              Compliance
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20 border border-blue-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/[0.12] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-6 border-t border-white/[0.06] bg-[#080B11]/95 space-y-3">
            <div className="flex flex-col space-y-2 text-xs text-slate-300 font-medium">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-white"
              >
                Platform
              </a>
              <a
                href="#preview"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-white"
              >
                Interface
              </a>
              <a
                href="#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-white"
              >
                Pipeline
              </a>
              <a
                href="#security"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-white"
              >
                Compliance
              </a>
            </div>
            <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full text-center py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white"
              >
                {user ? "Open Dashboard" : "Sign In to MedSync"}
              </Link>
            </div>
          </div>
        )}
      </header>
    );
  }

  // App Variant (Internal clinical workspace)
  return (
    <header className="h-16 sticky top-0 z-40 px-4 sm:px-6 border-b border-white/[0.07] bg-[#090D16]/85 backdrop-blur-xl flex items-center justify-between">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white ring-1 ring-white/20 group-hover:scale-105 transition-all">
            <HeartPulse className="w-4 h-4 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">
                MedSync
              </span>
              <span className="text-[10px] font-mono uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Clinical OS
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {user ? (
          <>
            {/* System Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-medium text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>PostgreSQL • PaddleOCR Active</span>
            </div>

            {/* Prominent SOS Trigger Button */}
            <SOSButton size="sm" />

            {/* User Profile Card & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/[0.05] transition-colors"
                title="Account menu"
              >
                <div className="w-7 h-7 rounded-lg bg-surface-800 border border-white/10 text-white flex items-center justify-center font-bold text-xs">
                  {user.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-medium text-slate-200 leading-tight">
                    {user.full_name}
                  </div>
                  <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                    {user.role}
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 p-1.5 rounded-2xl bg-[#0F1420] border border-white/10 shadow-2xl space-y-1 text-xs z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-white/[0.08]">
                    <div className="font-semibold text-white truncate">{user.full_name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                  </div>

                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Account Settings</span>
                  </Link>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

// Backward compatibility export
export const TopNavbar = GlassNavbar;
