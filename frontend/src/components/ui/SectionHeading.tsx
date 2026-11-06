"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  badge?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  eyebrow,
  badge,
  backHref,
  backLabel = "Back",
  actions,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] ${className}`}
    >
      <div className="space-y-1.5">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{backLabel}</span>
          </Link>
        )}

        {eyebrow && (
          <div className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-medium">
            {eyebrow}
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
            {title}
          </h1>
          {badge}
        </div>

        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
};

// Aliased as PageHeader for seamless backward compatibility
export const PageHeader = SectionHeading;
