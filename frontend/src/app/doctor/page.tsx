"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, PatientSummary, TimelineItem, MedicalDocument } from "@/lib/api";
import {
  Stethoscope,
  Search,
  User,
  Clock,
  Plus,
  CheckCircle2,
  FileText,
  AlertCircle,
  Pill,
  Heart,
  Calendar,
  Sparkles,
  ExternalLink,
  X,
  FileSearch,
  Eye,
  Loader2
} from "lucide-react";
import {
  PageContainer,
  SectionHeading,
  SurfaceCard,
  PrimaryButton,
  SecondaryButton,
  TimelineCard,
  MedicalBadge
} from "@/components/ui";

export default function DoctorPortalPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [patientDetail, setPatientDetail] = useState<any>(null);
  const [patientTimeline, setPatientTimeline] = useState<TimelineItem[]>([]);
  const [patientDocuments, setPatientDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [msg, setMsg] = useState("");

  // Drawer / modal states
  const [previewDoc, setPreviewDoc] = useState<MedicalDocument | null>(null);

  // New Clinical Note Form
  const [noteType, setNoteType] = useState("doctor_note");
  const [noteValue, setNoteValue] = useState("");
  const [noteDetails, setNoteDetails] = useState("");

  useEffect(() => {
    loadPatients();
  }, [user]);

  async function loadPatients() {
    try {
      setLoading(true);
      const list = await api.doctor.listPatients();
      setPatients(list || []);
      if (list && list.length > 0 && !selectedPatientId) {
        selectPatient(list[0].patient_id);
      }
    } catch (err) {
      console.error("Failed to load patients:", err);
    } finally {
      setLoading(false);
    }
  }

  async function selectPatient(patientId: string) {
    try {
      setSelectedPatientId(patientId);
      setLoadingDetail(true);
      const [detail, timeline, docs] = await Promise.all([
        api.doctor.getPatientDetail(patientId),
        api.timeline.get(undefined, patientId, true).catch(() => []),
        api.documents.list(patientId).catch(() => []),
      ]);
      setPatientDetail(detail);
      setPatientTimeline(timeline || []);
      setPatientDocuments(docs || []);
    } catch (err) {
      console.error("Failed to load patient detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleAddClinicalObservation(e: React.FormEvent) {
    e.preventDefault();
    if (!noteValue.trim() || !selectedPatientId) return;

    try {
      setSubmittingNote(true);
      setMsg("");
      await api.doctor.addEvent(
        selectedPatientId,
        noteType,
        noteValue.trim(),
        noteDetails.trim()
      );

      setNoteValue("");
      setNoteDetails("");
      setMsg("Clinical observation successfully appended to patient longitudinal EHR.");

      // Refresh patient timeline
      const updatedTl = await api.timeline.get(undefined, selectedPatientId, true);
      setPatientTimeline(updatedTl || []);
    } catch (err: any) {
      setMsg(err.message || "Failed to record clinical entry.");
    } finally {
      setSubmittingNote(false);
    }
  }

  const filteredPatients = patients.filter((p) => {
    return (
      p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <PageContainer maxWidth="wide">
      {/* Header */}
      <SectionHeading
        title="Doctor Clinical Workspace"
        subtitle="Desktop-first clinical command center. Review longitudinal EHR histories, evaluate AI-extracted diagnostics, and prescribe clinical interventions."
        backHref="/dashboard"
        backLabel="Dashboard"
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {patients.length} Active Patients
          </span>
        }
      />

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{msg}</span>
          </div>
          <button onClick={() => setMsg("")} className="font-bold text-emerald-400">
            ✕
          </button>
        </div>
      )}

      {/* Main Dual-Pane Layout: Left = Patient Directory, Right = Clinical Record & Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (4 cols): Patient Search & Directory */}
        <SurfaceCard className="lg:col-span-4 space-y-4 !p-5">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <div className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Patient Directory ({patients.length})
            </div>
            <span className="text-[10px] font-mono text-slate-500">Live EHR Sync</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredPatients.map((p) => {
              const isSelected = p.patient_id === selectedPatientId;
              return (
                <button
                  key={p.patient_id}
                  onClick={() => selectPatient(p.patient_id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                    isSelected
                      ? "border-blue-500/40 bg-blue-500/10 shadow-sm"
                      : "border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.04] hover:border-white/[0.12]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-xs text-white truncate">{p.full_name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/25 font-mono font-bold text-[10px]">
                      {p.blood_group}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">{p.email}</div>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-mono">
                    <span>{p.total_documents} Docs</span>
                    <span>•</span>
                    <span className="text-blue-400 font-medium">{p.total_records} Records</span>
                  </div>
                </button>
              );
            })}

            {filteredPatients.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">
                No patients match the search query.
              </div>
            )}
          </div>
        </SurfaceCard>

        {/* Right Column (8 cols): Clinical Patient File & Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {loadingDetail ? (
            <SurfaceCard className="p-20 text-center text-slate-500 space-y-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
              <p className="text-xs font-medium">Loading clinical chart...</p>
            </SurfaceCard>
          ) : patientDetail ? (
            <>
              {/* Patient Header Summary */}
              <SurfaceCard className="space-y-5 !p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                      {patientDetail.patient.full_name?.charAt(0) || "P"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-lg font-bold text-white font-sans">
                          {patientDetail.patient.full_name}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/20 text-xs font-mono font-bold">
                          {patientDetail.profile.blood_group}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Patient ID: <span className="font-mono">{patientDetail.patient.id.slice(0, 12)}...</span> • DOB: {patientDetail.profile.dob || "1988-06-14"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 text-xs font-medium">
                      {patientDocuments.length} Medical Documents
                    </span>
                  </div>
                </div>

                {/* Medical risk chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-1.5">
                    <div className="text-[10px] uppercase font-mono font-bold text-red-400 tracking-wider">
                      Critical Allergies
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {patientDetail.profile.allergies?.length > 0 ? (
                        patientDetail.profile.allergies.map((a: string, i: number) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-lg bg-red-500/20 text-red-200 border border-red-500/30 text-xs font-medium"
                          >
                            {a}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">None reported (NKDA)</span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-1.5">
                    <div className="text-[10px] uppercase font-mono font-bold text-blue-400 tracking-wider">
                      Chronic Medical Conditions
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {patientDetail.profile.chronic_conditions?.length > 0 ? (
                        patientDetail.profile.chronic_conditions.map((c: string, i: number) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-200 border border-blue-500/30 text-xs font-medium"
                          >
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">None reported</span>
                      )}
                    </div>
                  </div>
                </div>
              </SurfaceCard>

              {/* Patient's Documents Preview Strip */}
              <SurfaceCard className="space-y-3 !p-5">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider font-mono">
                    <FileSearch className="w-4 h-4 text-blue-400" />
                    <span>Attached Document Repository ({patientDocuments.length})</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {patientDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between gap-3 hover:border-white/[0.16] transition-all"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{doc.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {doc.filename} • {new Date(doc.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-blue-400 hover:text-white transition-colors"
                        title="Preview Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {patientDocuments.length === 0 && (
                    <div className="p-4 text-xs text-slate-500 col-span-2">
                      No documents uploaded for this patient.
                    </div>
                  )}
                </div>
              </SurfaceCard>

              {/* Add Clinical Note / Observation Entry */}
              <SurfaceCard className="space-y-4 !p-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider font-mono">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>Direct Clinical Entry / Intervention</span>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    Auto-Verified Clinician Authority
                  </span>
                </div>

                <form onSubmit={handleAddClinicalObservation} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={noteType}
                      onChange={(e) => setNoteType(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="doctor_note" className="bg-[#070A10]">Clinical Note / Impression</option>
                      <option value="medication" className="bg-[#070A10]">Prescribe Medication</option>
                      <option value="diagnosis" className="bg-[#070A10]">Add Clinical Diagnosis</option>
                      <option value="procedure" className="bg-[#070A10]">Record / Order Procedure</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Title or medication / condition name..."
                      value={noteValue}
                      onChange={(e) => setNoteValue(e.target.value)}
                      required
                      className="sm:col-span-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Instructions, dosage, diagnostic reasoning, follow-up..."
                    value={noteDetails}
                    onChange={(e) => setNoteDetails(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />

                  <div className="flex justify-end">
                    <PrimaryButton
                      type="submit"
                      disabled={submittingNote}
                      loading={submittingNote}
                      icon={CheckCircle2}
                      iconPosition="left"
                    >
                      Append to Longitudinal EHR
                    </PrimaryButton>
                  </div>
                </form>
              </SurfaceCard>

              {/* Patient Timeline Feed */}
              <SurfaceCard className="space-y-4 !p-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider font-mono">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>Longitudinal Trajectory ({patientTimeline.length} events)</span>
                  </div>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {patientTimeline.map((item, idx) => (
                    <TimelineCard
                      key={item.id}
                      item={item}
                      isLast={idx === patientTimeline.length - 1}
                    />
                  ))}

                  {patientTimeline.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No historical events recorded for this patient.
                    </div>
                  )}
                </div>
              </SurfaceCard>
            </>
          ) : (
            <SurfaceCard className="p-20 text-center text-slate-500 text-xs">
              Select a patient from the directory to inspect clinical records.
            </SurfaceCard>
          )}
        </div>
      </div>

      {/* Document Preview Drawer / Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <SurfaceCard className="relative w-full max-w-4xl max-h-[90vh] !p-6 flex flex-col space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="font-semibold text-white text-base font-sans">{previewDoc.title}</h3>
                <p className="text-xs text-slate-400">{previewDoc.filename}</p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto rounded-2xl bg-black/60 border border-white/[0.08] min-h-[450px]">
              {previewDoc.filename.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={api.documents.getFileUrl(previewDoc.id)}
                  className="w-full h-[500px] border-0"
                  title="PDF Preview"
                />
              ) : (
                <div className="p-4 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={api.documents.getFileUrl(previewDoc.id)}
                    alt={previewDoc.filename}
                    className="max-h-[500px] object-contain rounded"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                href={`/documents/${previewDoc.id}`}
                className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Open in Verification Workspace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <SecondaryButton onClick={() => setPreviewDoc(null)}>
                Close Preview
              </SecondaryButton>
            </div>
          </SurfaceCard>
        </div>
      )}
    </PageContainer>
  );
}
