"use client";

import React from "react";
import { motion } from "framer-motion";

export interface SurfaceCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "default" | "primary" | "danger" | "success";
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const SurfaceCard: React.FC<SurfaceCardProps> = ({
  children,
  className = "",
  glow = "default",
  hoverEffect = true,
  onClick,
}) => {
  const glowClasses = {
    default: "hover:border-white/[0.16]",
    primary: "border-blue-500/20 hover:border-blue-500/40 hover:shadow-sm hover:shadow-blue-500/10",
    danger: "border-red-500/20 hover:border-red-500/40 hover:shadow-sm hover:shadow-red-500/10",
    success: "border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-sm hover:shadow-emerald-500/10",
  }[glow];

  const Component = hoverEffect ? motion.div : "div";
  const motionProps = hoverEffect
    ? {
        whileHover: { y: -2 },
        transition: { duration: 0.15 },
      }
    : {};

  return (
    // @ts-ignore
    <Component
      onClick={onClick}
      {...motionProps}
      className={`p-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-xl transition-all duration-200 ${glowClasses} ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </Component>
  );
};
