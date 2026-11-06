"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { FileUp, Upload, Sparkles, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function DocumentUploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      setErrorMsg("");
      const doc = await api.documents.upload(selectedFile, title || selectedFile.name);
      router.push(`/documents/${doc.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Upload and OCR extraction failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Upload Clinical Document"
        subtitle="Submit medical PDF reports or scans. Our pipeline will render 300 DPI pages with PaddleOCR and extract clinical entities for verification."
        backHref="/documents"
        backLabel="Back to Documents"
      />

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form
        onSubmit={handleUpload}
        className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6"
      >
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Document Title (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Metabolic Blood Test & Clinical Evaluation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Select Medical File
          </label>
          <div className="border-2 border-dashed border-slate-700/80 hover:border-blue-500/80 rounded-2xl p-8 text-center transition-all cursor-pointer bg-slate-800/40">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-input-page"
            />
            <label htmlFor="file-input-page" className="cursor-pointer space-y-2 block">
              <Upload className="w-10 h-10 text-blue-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-200">
                {selectedFile ? selectedFile.name : "Click to select or drag and drop file"}
              </div>
              <p className="text-xs text-slate-400">
                PDF, PNG, JPG, or JPEG up to 20 MB
              </p>
            </label>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-900/40 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-200 leading-relaxed">
            Upon upload, MedSync will immediately perform OCR and extract structured diagnoses, medications, allergies, and procedures for clinician review.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/documents"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-glow disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Optical OCR...</span>
              </>
            ) : (
              <>
                <FileUp className="w-4 h-4" />
                <span>Upload & Run Extraction</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
