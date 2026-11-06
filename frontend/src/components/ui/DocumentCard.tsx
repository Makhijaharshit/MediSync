"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Sparkles, ExternalLink, CheckCircle2, Eye, Calendar, HardDrive, Trash2 } from "lucide-react";
import { MedicalDocument, api } from "@/lib/api";
import { StatusChip } from "@/components/ui/StatusChip";

interface DocumentCardProps {
  document: MedicalDocument;
  onSelect?: (doc: MedicalDocument) => void;
  onDelete?: (doc: MedicalDocument) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onSelect, onDelete }) => {
  const isPdf = document.filename?.toLowerCase().endsWith(".pdf") || document.file_type?.includes("pdf");
  const isVerified = document.status === "verified";
  const entityCount = document.entities?.length || 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl hover:border-white/[0.16] transition-all flex flex-col justify-between gap-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isPdf
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
            }`}
          >
            <FileText className="w-5 h-5" />
          </div>

          <div className="min-w-0 space-y-1">
            <h3 className="text-sm font-semibold text-white truncate hover:text-blue-400 transition-colors">
              <Link href={`/documents/${document.id}`}>{document.title}</Link>
            </h3>
            <p className="text-xs text-slate-400 truncate">{document.filename}</p>
          </div>
        </div>

        <StatusChip status={document.status} />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{new Date(document.created_at).toLocaleDateString()}</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5 text-slate-500" />
          <span>{(document.file_size / 1024).toFixed(1)} KB</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5 text-blue-400 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{entityCount} Entities</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <a
          href={api.documents.getFileUrl(document.id)}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>Raw File</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={() => onDelete(document)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
              title="Delete document"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <Link
            href={`/documents/${document.id}`}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              isVerified
                ? "bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08]"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20"
            }`}
          >
            {isVerified ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verify & Commit</span>
              </>
            )}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
