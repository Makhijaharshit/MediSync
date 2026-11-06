"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon, Loader2 } from "lucide-react";

export interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "danger" | "emerald";
  children: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  href,
  icon: Icon,
  iconPosition = "right",
  loading = false,
  size = "md",
  variant = "primary",
  children,
  className = "",
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2.5 text-xs rounded-xl gap-2",
    lg: "px-6 py-3.5 text-sm rounded-2xl gap-2.5",
  }[size];

  const variantClasses = {
    primary:
      "bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/25 border border-blue-400/30 hover:border-blue-300/40",
    danger:
      "bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-500/25 border border-red-400/30 hover:border-red-300/40",
    emerald:
      "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-500/25 border border-emerald-400/30 hover:border-emerald-300/40",
  }[variant];

  const baseClasses = `inline-flex items-center justify-center font-medium tracking-tight transition-all duration-200 cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${className}`;

  const content = (
    <>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        Icon && iconPosition === "left" && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === "right" && <Icon className="w-4 h-4 shrink-0" />}
    </>
  );

  if (href && !disabled && !loading) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button className={baseClasses} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
};
