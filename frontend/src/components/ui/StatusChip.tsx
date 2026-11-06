import React from "react";
import { CheckCircle2, Clock, AlertTriangle, XCircle, RefreshCw } from "lucide-react";

export type StatusChipVariant =
  | "verified"
  | "unverified"
  | "processing"
  | "failed"
  | "pending"
  | "active"
  | "resolved"
  | "cancelled";

interface StatusChipProps {
  status: StatusChipVariant | string;
  className?: string;
  showIcon?: boolean;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  className = "",
  showIcon = true,
}) => {
  const norm = status?.toLowerCase() || "pending";

  const config = {
    verified: {
      label: "Verified",
      style: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      dot: "bg-emerald-400",
      icon: CheckCircle2,
    },
    unverified: {
      label: "Needs Review",
      style: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      dot: "bg-amber-400",
      icon: Clock,
    },
    processing: {
      label: "OCR Processing",
      style: "bg-blue-500/10 text-blue-300 border-blue-500/20",
      dot: "bg-blue-400 animate-ping",
      icon: RefreshCw,
    },
    failed: {
      label: "Failed",
      style: "bg-red-500/10 text-red-300 border-red-500/20",
      dot: "bg-red-500",
      icon: XCircle,
    },
    pending: {
      label: "Pending",
      style: "bg-white/[0.04] text-slate-300 border-white/[0.08]",
      dot: "bg-slate-400",
      icon: Clock,
    },
    active: {
      label: "Active SOS",
      style: "bg-red-500/15 text-red-200 border-red-500/30 animate-pulse",
      dot: "bg-red-400 animate-ping",
      icon: AlertTriangle,
    },
    resolved: {
      label: "Resolved",
      style: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      dot: "bg-emerald-400",
      icon: CheckCircle2,
    },
    cancelled: {
      label: "Cancelled",
      style: "bg-white/[0.04] text-slate-400 border-white/[0.08]",
      dot: "bg-slate-500",
      icon: XCircle,
    },
  }[norm] || {
    label: norm,
    style: "bg-white/[0.04] text-slate-300 border-white/[0.08]",
    dot: "bg-slate-400",
    icon: Clock,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide border backdrop-blur-md transition-all ${config.style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};
