"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export interface SidebarItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  href,
  icon: Icon,
  badge,
  isActive = false,
  isCollapsed = false,
  onClick,
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
        isActive
          ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm"
          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
      }`}
      title={isCollapsed ? label : undefined}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon
          className={`w-4 h-4 shrink-0 transition-colors ${
            isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
          }`}
        />
        {!isCollapsed && <span className="truncate tracking-tight">{label}</span>}
      </div>

      {!isCollapsed && badge && (
        <span
          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full border ${
            badge === "Critical"
              ? "bg-red-500/15 text-red-300 border-red-500/30 font-bold"
              : badge === "Live"
              ? "bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse font-bold"
              : "bg-blue-500/10 text-blue-300 border-blue-500/20"
          }`}
        >
          {badge}
        </span>
      )}

      {/* Active accent indicator */}
      {isActive && (
        <motion.div
          layoutId="activeSidebarIndicator"
          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-blue-500"
        />
      )}
    </Link>
  );
};
