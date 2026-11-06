"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, AlertTriangle, ArrowRight, MapPin } from "lucide-react";
import { EmergencyEvent } from "@/lib/api";

interface EmergencyAlertCardProps {
  event?: EmergencyEvent | null;
  allergyAlerts?: string[];
  className?: string;
  onManage?: () => void;
}

export const EmergencyAlertCard: React.FC<EmergencyAlertCardProps> = ({
  event,
  allergyAlerts = [],
  className = "",
  onManage,
}) => {
  if (!event && allergyAlerts.length === 0) return null;

  if (event && event.status === "active") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-red-950/20 to-[#0A0E17] border border-red-500/40 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative p-2.5 rounded-xl bg-red-600/30 border border-red-500/50 text-red-300 shrink-0">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">
                Active SOS Distress Beacon
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                LIVE
              </span>
            </div>
            <div className="text-sm font-semibold text-white flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-red-300">
                <MapPin className="w-3.5 h-3.5" />
                {event.location_name || "Emergency Coordinates"}
              </span>
              <span className="text-xs font-mono text-slate-400">
                ({event.latitude?.toFixed(4)}, {event.longitude?.toFixed(4)})
              </span>
            </div>
            {event.notes && (
              <p className="text-xs text-red-200/90 line-clamp-1">{event.notes}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          <Link
            href="/emergency"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>Responder Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>
    );
  }

  // Critical Allergies alert if no active SOS
  if (allergyAlerts.length > 0) {
    return (
      <div
        className={`p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md flex items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="text-xs text-amber-200 font-normal">
            <span className="font-semibold text-amber-300 uppercase tracking-wide mr-1.5">
              Warning:
            </span>
            Severe adverse reactions documented for {allergyAlerts.join(", ")}.
          </div>
        </div>

        <Link
          href="/emergency"
          className="text-xs font-medium text-amber-400 hover:text-amber-300 shrink-0 underline"
        >
          View Protocols
        </Link>
      </div>
    );
  }

  return null;
};
