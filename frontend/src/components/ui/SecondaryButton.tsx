"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon, Loader2 } from "lucide-react";

export interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  href,
  icon: Icon,
  iconPosition = "left",
  loading = false,
  size = "md",
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

  const baseClasses = `inline-flex items-center justify-center font-medium tracking-tight bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/[0.1] hover:border-white/[0.2] transition-all duration-200 cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${className}`;

  const content = (
    <>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        Icon && iconPosition === "left" && <Icon className="w-4 h-4 shrink-0 text-slate-400" />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === "right" && <Icon className="w-4 h-4 shrink-0 text-slate-400" />}
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
