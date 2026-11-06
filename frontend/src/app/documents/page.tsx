"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, MedicalDocument } from "@/lib/api";
import {
  FileText,
  Upload,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileUp,
  Sparkles,
  Filter,
  Loader2,
  HardDrive,
  Trash2,
  X
} from "lucide-react";
import {
  PageContainer,
  SectionHeading,
  SurfaceCard,
  PrimaryButton,
  SecondaryButton,
  DocumentCard,
  StatusChip
} from "@/components/ui";

export default function DocumentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingDoc, setDeletingDoc] = useState<MedicalDocument | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Drag and drop state
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, [user]);

  async function loadDocuments() {
    try {
      setLoading(true);
      const data = await api.documents.list();
      setDocuments(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load medical documents.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingDoc) return;
    try {
      setDeleteLoading(true);
      setErrorMsg("");
      await api.documents.delete(deletingDoc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== deletingDoc.id));
      setDeletingDoc(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete medical document.");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleFileProcess(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["pdf", "png", "jpg", "jpeg"].includes(ext)) {
      setErrorMsg("Unsupported file format. Please upload PDF, PNG, JPG, or JPEG.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg("File exceeds 20 MB size limit.");
      return;
    }

    try {
      setUploading(true);
      setErrorMsg("");
      setUploadProgress("Ingesting file & rasterizing at 300 DPI with PyMuPDF...");

      const doc = await api.documents.upload(file, file.name);

      setUploadProgress("Running PaddleOCR & structured clinical NLP extraction...");

      setTimeout(() => {
        router.push(`/documents/${doc.id}`);
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || "Upload and OCR processing failed.");
      setUploading(false);
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      statusFilter === "all" ? true : doc.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const unverifiedCount = documents.filter((d) => d.status === "unverified").length;
  const verifiedCount = documents.filter((d) => d.status === "verified").length;

  return (
    <PageContainer>
      {/* Page Header */}
      <SectionHeading
        title="Medical Documents & Optical OCR"
        subtitle="Upload discharge summaries, lab reports, or scans. Our pipeline renders 300 DPI pages with PaddleOCR and clinical NLP for clinician review."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {documents.length} Records
          </span>
        }
        actions={
          <PrimaryButton
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            icon={Upload}
            iconPosition="left"
          >
            Upload Document
          </PrimaryButton>
        }
      />

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 backdrop-blur-xl ${
          dragActive
            ? "border-blue-400 bg-blue-950/20 scale-[1.005]"
            : "border-white/[0.1] hover:border-white/[0.2] bg-white/[0.015]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="py-4 space-y-4 max-w-md mx-auto">
            <div className="relative w-12 h-12 mx-auto">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <Sparkles className="w-5 h-5 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-white">Processing Document</div>
              <p className="text-xs text-blue-400 font-mono animate-pulse">{uploadProgress}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <FileUp className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-white">
                Drag and drop medical file, or{" "}
                <span className="text-blue-400 underline underline-offset-2">browse files</span>
              </div>
              <p className="text-xs text-slate-400">
                Supports PDF (multi-page 300 DPI), PNG, JPG, or JPEG up to 20 MB
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono">
              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08]">PDF</span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08]">PNG</span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08]">JPG</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Strict zero-hallucination schema</span>
            </div>
          </div>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <SurfaceCard className="!p-3 sm:!p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search documents by title or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {[
            { id: "all", label: `All (${documents.length})` },
            { id: "unverified", label: `Needs Review (${unverifiedCount})` },
            { id: "verified", label: `Verified (${verifiedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </SurfaceCard>

      {/* Documents Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 text-xs font-medium">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
          <span>Loading medical document repository...</span>
        </div>
      ) : filteredDocs.length === 0 ? (
        <SurfaceCard className="p-16 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-base font-semibold text-white">No documents found</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "all"
              ? "No documents match the active search query or filter."
              : "Upload your first clinical record or test result to start the OCR extraction pipeline."}
          </p>
        </SurfaceCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDelete={(d) => setDeletingDoc(d)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#0B0F19] border border-white/[0.12] shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Delete Medical Record?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to delete <span className="text-white font-medium">"{deletingDoc.title}"</span>? This will permanently remove the file, all extracted clinical entities, and associated timeline entries.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDoc(null)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 shadow-sm shadow-red-500/20 transition-all flex items-center gap-1.5"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
