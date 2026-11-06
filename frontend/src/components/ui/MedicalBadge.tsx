import React from "react";

export type MedicalBadgeVariant =
  | "diagnosis"
  | "medication"
  | "allergy"
  | "procedure"
  | "lab_result"
  | "blood_group"
  | "critical"
  | "warning"
  | "neutral";

interface MedicalBadgeProps {
  variant?: MedicalBadgeVariant | string;
  type?: MedicalBadgeVariant | string;
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const MedicalBadge: React.FC<MedicalBadgeProps> = ({
  variant,
  type,
  children,
  className = "",
  size = "md",
}) => {
  const activeVariant = (type || variant || "neutral").toLowerCase();

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3.5 py-1 text-sm",
  }[size];

  const getVariantStyles = () => {
    switch (activeVariant) {
      case "diagnosis":
        return "bg-purple-500/10 text-purple-300 border-purple-500/20";
      case "medication":
        return "bg-blue-500/10 text-blue-300 border-blue-500/20";
      case "allergy":
        return "bg-red-500/10 text-red-300 border-red-500/20";
      case "procedure":
        return "bg-amber-500/10 text-amber-300 border-amber-500/20";
      case "lab_result":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
      case "blood_group":
        return "bg-red-500/15 text-red-200 border-red-500/30 font-mono font-bold tracking-tight";
      case "critical":
        return "bg-red-500/20 text-red-200 border-red-500/40 font-bold animate-pulse";
      case "warning":
        return "bg-amber-500/15 text-amber-200 border-amber-500/30";
      default:
        return "bg-white/[0.04] text-slate-300 border-white/[0.08]";
    }
  };

  const defaultLabel =
    activeVariant === "lab_result"
      ? "Lab Result"
      : activeVariant.charAt(0).toUpperCase() + activeVariant.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium tracking-wide backdrop-blur-md transition-colors ${sizeClasses} ${getVariantStyles()} ${className}`}
    >
      {children || defaultLabel}
    </span>
  );
};
