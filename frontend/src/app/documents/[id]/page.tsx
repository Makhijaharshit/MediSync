"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api, MedicalDocument, MedicalEntity } from "@/lib/api";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  ExternalLink,
  ShieldCheck,
  FileSearch,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Loader2,
  X
} from "lucide-react";
import {
  PageContainer,
  SectionHeading,
  SurfaceCard,
  PrimaryButton,
  SecondaryButton,
  StatusChip,
  MedicalBadge
} from "@/components/ui";

export default function DocumentVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;

  const [document, setDocument] = useState<MedicalDocument | null>(null);
  const [entities, setEntities] = useState<MedicalEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleDeleteDocument() {
    if (!document) return;
    try {
      setDeleting(true);
      setErrorMsg("");
      await api.documents.delete(document.id);
      router.push("/documents");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete medical document.");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  // Viewer controls
  const [showOcrText, setShowOcrText] = useState(false);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // New entity form state
  const [newType, setNewType] = useState<"diagnosis" | "medication" | "allergy" | "procedure" | "lab_result">("diagnosis");
  const [newValue, setNewValue] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [newPage, setNewPage] = useState(1);

  useEffect(() => {
    async function fetchDoc() {
      try {
        setLoading(true);
        const data = await api.documents.get(docId);
        setDocument(data);
        setEntities(data.entities || []);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load document details");
      } finally {
        setLoading(false);
      }
    }
    if (docId) {
      fetchDoc();
    }
  }, [docId]);

  function handleEntityChange(index: number, field: keyof MedicalEntity, val: any) {
    const updated = [...entities];
    updated[index] = { ...updated[index], [field]: val };
    setEntities(updated);
  }

  function handleAddEntity() {
    if (!newValue.trim()) return;
    const item: MedicalEntity = {
      type: newType,
      value: newValue.trim(),
      details: newDetails.trim(),
      confidence: 1.0,
      verified: true,
      source_page: newPage,
    };
    setEntities([...entities, item]);
    setNewValue("");
    setNewDetails("");
  }

  function handleDeleteEntity(index: number) {
    const updated = entities.filter((_, i) => i !== index);
    setEntities(updated);
  }

  async function handleVerifySubmit() {
    try {
      setSaving(true);
      setErrorMsg("");
      setSuccessMsg("");

      const payload = {
        entities: entities.map((e) => ({
          type: e.type,
          value: e.value,
          details: e.details || "",
          confidence: e.confidence ?? 1.0,
          verified: e.verified,
          source_page: e.source_page || 1,
        })),
      };

      const updatedDoc = await api.documents.verify(docId, payload.entities as MedicalEntity[]);
      setDocument(updatedDoc);
      setEntities(updatedDoc.entities || []);
      setSuccessMsg("Document verified successfully! Confirmed entities published to longitudinal timeline.");

      setTimeout(() => {
        router.push("/timeline");
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save verification.");
    } finally {
      setSaving(false);
    }
  }

  function getConfidenceBadge(confidence: number) {
    const pct = Math.round(confidence * 100);
    if (pct >= 90) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          ● {pct}% Conf
        </span>
      );
    }
    if (pct >= 75) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
          ▲ {pct}% Review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-red-500/10 text-red-300 border border-red-500/20">
        ▼ {pct}% Low
      </span>
    );
  }

  if (loading) {
    return (
      <PageContainer maxWidth="wide">
        <div className="p-20 text-center text-slate-500 space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          <p className="text-xs font-medium">Loading document OCR and clinical extractions...</p>
        </div>
      </PageContainer>
    );
  }

  if (!document) {
    return (
      <PageContainer maxWidth="wide">
        <SurfaceCard className="p-16 text-center space-y-3">
          <p className="text-sm font-semibold text-white">Document not found.</p>
          <Link href="/documents" className="text-xs text-blue-400 hover:underline">
            Return to Documents
          </Link>
        </SurfaceCard>
      </PageContainer>
    );
  }

  const isPdf = document.filename?.toLowerCase().endsWith(".pdf") || document.file_type?.includes("pdf");
  const isVerified = document.status === "verified";
  const fileUrl = api.documents.getFileUrl(docId);

  const filteredEntities =
    selectedCategory === "all"
      ? entities
      : entities.filter((e) => e.type === selectedCategory);

  return (
    <PageContainer maxWidth="wide">
      {/* Top Header */}
      <SectionHeading
        title={document.title}
        subtitle={`Uploaded: ${new Date(document.created_at).toLocaleString()} • File: ${document.filename} (${(document.file_size / 1024).toFixed(1)} KB)`}
        backHref="/documents"
        backLabel="Back to Documents"
        badge={<StatusChip status={document.status} />}
        actions={
          <div className="flex items-center gap-2.5">
            <SecondaryButton
              onClick={() => setShowDeleteModal(true)}
              disabled={saving || deleting}
              icon={Trash2}
              iconPosition="left"
              className="hover:!bg-red-500/10 hover:!text-red-400 hover:!border-red-500/30 text-slate-400"
            >
              Delete Record
            </SecondaryButton>
            <PrimaryButton
              onClick={handleVerifySubmit}
              disabled={saving || deleting}
              variant="emerald"
              loading={saving}
              icon={ShieldCheck}
              iconPosition="left"
            >
              {saving ? "Publishing to Timeline..." : "Verify & Save to Timeline"}
            </PrimaryButton>
          </div>
        }
      />

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Split Layout: Left = Document Viewer & OCR Stream, Right = AI Extracted Entities Annotation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (6 cols): Document Viewer & Collapsible Raw OCR */}
        <div className="lg:col-span-6 space-y-4">
          <SurfaceCard className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <FileSearch className="w-4 h-4 text-blue-400" />
                <span>Original Document Preview</span>
              </div>

              <div className="flex items-center gap-2">
                {!isPdf && (
                  <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
                    <button
                      onClick={() => setZoomScale((prev) => Math.max(0.5, prev - 0.25))}
                      className="p-1 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono font-medium px-1 text-slate-300">
                      {Math.round(zoomScale * 100)}%
                    </span>
                    <button
                      onClick={() => setZoomScale((prev) => Math.min(3.0, prev + 0.25))}
                      className="p-1 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setZoomScale(1.0)}
                      className="p-1 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white"
                      title="Reset Zoom"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                >
                  <span>Open Full</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Document Viewer Frame */}
            <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-black/60 min-h-[480px] flex items-center justify-center">
              {isPdf ? (
                <iframe
                  src={fileUrl}
                  className="w-full h-[540px] rounded-2xl border-0"
                  title="PDF Document Viewer"
                />
              ) : (
                <div className="w-full h-[540px] overflow-auto flex items-center justify-center p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fileUrl}
                    alt={document.filename}
                    style={{ transform: `scale(${zoomScale})`, transformOrigin: "top center" }}
                    className="max-w-full rounded shadow-xl transition-transform duration-150 ease-out object-contain"
                  />
                </div>
              )}
            </div>

            {/* Collapsible Raw OCR Stream Reference */}
            <div className="border border-white/[0.08] rounded-2xl overflow-hidden bg-black/40">
              <button
                type="button"
                onClick={() => setShowOcrText(!showOcrText)}
                className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-slate-300 hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Raw PaddleOCR Stream (300 DPI)</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({(document.ocr_text || "").length} characters)
                  </span>
                </div>
                {showOcrText ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showOcrText && (
                <div className="p-4 border-t border-white/[0.08] bg-black/60 text-slate-300 font-mono text-xs leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-wrap selection:bg-blue-600 selection:text-white">
                  {document.ocr_text || "No OCR text extracted."}
                </div>
              )}
            </div>
          </SurfaceCard>
        </div>

        {/* Right Column (6 cols): AI Extracted Entities & Clinician Review */}
        <SurfaceCard className="lg:col-span-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.08] gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Extracted Clinical Entities ({entities.length})</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Review, edit, or remove entries before committing
            </span>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            {["all", "diagnosis", "medication", "allergy", "procedure", "lab_result"].map((cat) => {
              const count =
                cat === "all"
                  ? entities.length
                  : entities.filter((e) => e.type === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                      : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
                  }`}
                >
                  {cat === "all" ? "All" : cat.replace("_", " ")} ({count})
                </button>
              );
            })}
          </div>

          {/* Entities List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredEntities.map((entity, idx) => {
              const realIndex = entities.indexOf(entity);
              return (
                <div
                  key={realIndex}
                  className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.015] hover:border-white/[0.16] transition-all space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <MedicalBadge variant={entity.type}>
                        {entity.type.replace("_", " ")}
                      </MedicalBadge>

                      {getConfidenceBadge(entity.confidence ?? 1.0)}

                      <span className="text-[10px] font-mono font-medium text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.08]">
                        Page {entity.source_page || 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={entity.verified}
                          onChange={(e) =>
                            handleEntityChange(realIndex, "verified", e.target.checked)
                          }
                          className="rounded border-white/20 text-blue-600 focus:ring-blue-500 w-4 h-4 bg-black/40"
                        />
                        <span className="font-medium text-[11px]">Verified</span>
                      </label>

                      <button
                        onClick={() => handleDeleteEntity(realIndex)}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete False Positive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                        Clinical Entity / Value
                      </label>
                      <input
                        type="text"
                        value={entity.value}
                        onChange={(e) => handleEntityChange(realIndex, "value", e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                        Instructions / Clinical Details
                      </label>
                      <input
                        type="text"
                        value={entity.details || ""}
                        onChange={(e) => handleEntityChange(realIndex, "details", e.target.value)}
                        placeholder="e.g. 500mg BID oral, HbA1c 7.4%"
                        className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredEntities.length === 0 && (
              <div className="p-8 rounded-2xl bg-white/[0.015] border border-white/[0.06] text-center text-xs text-slate-400">
                No entities found in this category.
              </div>
            )}
          </div>

          {/* Add custom entity manual form */}
          <div className="p-4 rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.01] space-y-3">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>Add Custom Observation / Correct Entity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <select
                value={newType}
                onChange={(e: any) => setNewType(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="diagnosis">Diagnosis</option>
                <option value="medication">Medication</option>
                <option value="allergy">Allergy</option>
                <option value="procedure">Procedure</option>
                <option value="lab_result">Lab Result</option>
              </select>

              <input
                type="text"
                placeholder="Name or clinical term..."
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />

              <input
                type="text"
                placeholder="Details / dosage / test value..."
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />

              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={newPage}
                  onChange={(e) => setNewPage(parseInt(e.target.value) || 1)}
                  placeholder="Page"
                  className="w-16 px-2 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-blue-500"
                  title="Source Page Number"
                />
                <button
                  type="button"
                  onClick={handleAddEntity}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 transition-colors shadow-sm"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Save & Verify Button */}
          <div className="pt-2 flex justify-end">
            <PrimaryButton
              onClick={handleVerifySubmit}
              disabled={saving}
              variant="emerald"
              loading={saving}
              icon={CheckCircle2}
              iconPosition="left"
            >
              {saving ? "Saving to Timeline..." : "Approve & Push to Timeline"}
            </PrimaryButton>
          </div>
        </SurfaceCard>
      </div>

      {/* Delete Document Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#0B0F19] border border-white/[0.12] shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Delete Medical Record?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to delete <span className="text-white font-medium">"{document.title}"</span>? This will permanently delete the source file, all {entities.length} extracted clinical entities, and any timeline events generated from it.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDocument}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 shadow-sm shadow-red-500/20 transition-all flex items-center gap-1.5"
              >
                {deleting ? (
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
