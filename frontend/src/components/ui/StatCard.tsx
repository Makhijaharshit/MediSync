"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title?: string;
  label?: string;
  value: string | number;
  subtitle?: string;
  subValue?: string;
  icon: LucideIcon;
  variant?: "primary" | "emerald" | "success" | "amber" | "warning" | "rose" | "danger" | "indigo" | "default";
  badge?: string;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  label,
  value,
  subtitle,
  subValue,
  icon: Icon,
  variant = "default",
  badge,
  onClick,
  className = "",
}) => {
  const displayLabel = title || label || "Metric";
  const displaySub = subtitle || subValue;

  const getStyles = () => {
    switch (variant) {
      case "primary":
        return {
          iconBg: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
          accent: "text-white",
          glow: "hover:border-blue-500/30",
        };
      case "emerald":
      case "success":
        return {
          iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
          accent: "text-white",
          glow: "hover:border-emerald-500/30",
        };
      case "amber":
      case "warning":
        return {
          iconBg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
          accent: "text-white",
          glow: "hover:border-amber-500/30",
        };
      case "rose":
      case "danger":
        return {
          iconBg: "bg-red-500/10 text-red-400 border border-red-500/20",
          accent: "text-white",
          glow: "hover:border-red-500/30",
        };
      case "indigo":
        return {
          iconBg: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
          accent: "text-white",
          glow: "hover:border-indigo-500/30",
        };
      default:
        return {
          iconBg: "bg-white/[0.04] text-slate-300 border border-white/[0.08]",
          accent: "text-white",
          glow: "hover:border-white/[0.15]",
        };
    }
  };

  const styles = getStyles();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`relative p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl transition-all duration-200 ${
        onClick ? "cursor-pointer" : ""
      } ${styles.glow} ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          {displayLabel}
        </span>
        <div className={`p-2.5 rounded-xl ${styles.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <div className={`text-2xl font-bold font-mono tracking-tight ${styles.accent}`}>
          {value}
        </div>
        {badge && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {badge}
          </span>
        )}
      </div>

      {displaySub && (
        <div className="mt-1.5 text-xs text-slate-400 font-normal line-clamp-1">
          {displaySub}
        </div>
      )}
    </motion.div>
  );
};
