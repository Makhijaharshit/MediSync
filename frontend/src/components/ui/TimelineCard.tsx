"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  Pill,
  ShieldAlert,
  Activity,
  FileSearch,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Calendar,
  ExternalLink,
  FlaskConical,
  ClipboardList,
  Trash2
} from "lucide-react";
import { TimelineItem } from "@/lib/api";
import { MedicalBadge } from "@/components/ui/MedicalBadge";

interface TimelineCardProps {
  item: TimelineItem;
  isLast?: boolean;
  onDelete?: (item: TimelineItem) => void;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({ item, isLast = false, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const getIcon = () => {
    switch (item.type?.toLowerCase()) {
      case "diagnosis":
        return <Activity className="w-4 h-4 text-purple-400" />;
      case "medication":
        return <Pill className="w-4 h-4 text-blue-400" />;
      case "allergy":
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case "procedure":
        return <Stethoscope className="w-4 h-4 text-amber-400" />;
      case "lab_result":
        return <FlaskConical className="w-4 h-4 text-emerald-400" />;
      default:
        return <ClipboardList className="w-4 h-4 text-slate-400" />;
    }
  };

  const getIconBg = () => {
    switch (item.type?.toLowerCase()) {
      case "diagnosis":
        return "bg-purple-500/10 border-purple-500/20";
      case "medication":
        return "bg-blue-500/10 border-blue-500/20";
      case "allergy":
        return "bg-red-500/10 border-red-500/20";
      case "procedure":
        return "bg-amber-500/10 border-amber-500/20";
      case "lab_result":
        return "bg-emerald-500/10 border-emerald-500/20";
      default:
        return "bg-white/[0.04] border-white/[0.08]";
    }
  };

  const confidencePct = Math.round((item.confidence || 1.0) * 100);

  return (
    <div className="relative flex gap-4 sm:gap-6 group">
      {/* Vertical connection line */}
      {!isLast && (
        <span
          className="absolute left-4 sm:left-5 top-10 -bottom-2 w-px bg-white/[0.08]"
          aria-hidden="true"
        />
      )}

      {/* Event node badge */}
      <div
        className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center shrink-0 backdrop-blur-xl transition-transform group-hover:scale-105 ${getIconBg()}`}
      >
        {getIcon()}
      </div>

      {/* Main event card */}
      <motion.div
        layout
        className="flex-1 mb-6 p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl hover:border-white/[0.16] transition-all space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <MedicalBadge variant={item.type}>{item.type.replace("_", " ")}</MedicalBadge>

            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{item.date_recorded || "Recorded"}</span>
            </span>

            {item.verified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {onDelete && (
              <button
                onClick={() => onDelete(item)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                title="Delete medical record"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.04]"
            >
              <span>{expanded ? "Less" : "Details"}</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
            {item.value}
          </h3>
          {item.details && (
            <p className="text-xs sm:text-sm text-slate-300/90 mt-1 leading-relaxed">
              {item.details}
            </p>
          )}
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3 border-t border-white/[0.06] space-y-2 text-xs text-slate-400"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 font-medium">Confidence Score:</span>{" "}
                  <span className="font-mono font-semibold text-slate-200">{confidencePct}%</span>
                </div>
                {item.created_at && (
                  <div>
                    <span className="text-slate-500 font-medium">Indexed At:</span>{" "}
                    <span className="text-slate-200">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {item.source_document_id && (
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-slate-500">
                    Source: {item.source_document_title || "Clinical Document"}
                  </span>
                  <Link
                    href={`/documents/${item.source_document_id}`}
                    className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    <span>View Source Document</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
