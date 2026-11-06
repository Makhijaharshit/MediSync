"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, MedicalDocument, TimelineItem, EmergencyProfile, EmergencyEvent } from "@/lib/api";
import {
  FileText,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Upload,
  ArrowRight,
  Heart,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  Ambulance
} from "lucide-react";
import {
  PageContainer,
  SurfaceCard,
  PrimaryButton,
  SecondaryButton,
  StatCard,
  StatusChip,
  MedicalBadge,
  EmergencyAlertCard
} from "@/components/ui";

export default function DashboardPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [profile, setProfile] = useState<EmergencyProfile | null>(null);
  const [activeSOS, setActiveSOS] = useState<EmergencyEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        if (user?.role === "patient") {
          const [docs, tl, prof, events] = await Promise.all([
            api.documents.list().catch(() => []),
            api.timeline.get().catch(() => []),
            api.emergency.getProfile().catch(() => null),
            api.emergency.getEvents("active").catch(() => []),
          ]);
          setDocuments(docs || []);
          setTimeline(tl || []);
          setProfile(prof || null);
          const userSOS = (events || []).find((e) => e.patient_id === user.id);
          setActiveSOS(userSOS || null);
        } else if (user?.role === "doctor") {
          const [events, docs] = await Promise.all([
            api.emergency.getEvents("active").catch(() => []),
            api.documents.list().catch(() => []),
          ]);
          setActiveSOS(events[0] || null);
          setDocuments(docs || []);
        } else if (user?.role === "paramedic") {
          const events = await api.emergency.getEvents("active").catch(() => []);
          setActiveSOS(events[0] || null);
        } else {
          // Admin
          const [docs, events] = await Promise.all([
            api.documents.list().catch(() => []),
            api.emergency.getEvents("active").catch(() => []),
          ]);
          setDocuments(docs || []);
          setActiveSOS(events[0] || null);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadData();
    }
  }, [user]);

  const verifiedEntitiesCount = timeline.filter((t) => t.verified).length;
  const unverifiedDocsCount = documents.filter((d) => d.status === "unverified").length;

  return (
    <PageContainer>
      {/* Active Distress Beacon Banner if SOS is active */}
      {activeSOS && (
        <EmergencyAlertCard event={activeSOS} onManage={() => {}} />
      )}

      {/* Header Banner */}
      <SurfaceCard className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 !p-6 sm:!p-8">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-mono tracking-wider uppercase font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>MedSync Clinical OS • Session Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
            Welcome back, {user?.full_name || "Clinician"}
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            {user?.role === "patient" &&
              "Your longitudinal EHR history, verified prescriptions, and paramedic responder beacon are synchronized."}
            {user?.role === "doctor" &&
              "Review verified clinical timelines, diagnose anomalies, and register new clinical interventions."}
            {user?.role === "paramedic" &&
              "Emergency responder dispatch console connected. Live distress beacons active."}
            {user?.role === "admin" &&
              "System administrator console. HIPAA audit trails and access control logs online."}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 relative z-10 flex-wrap">
          <PrimaryButton href="/documents/upload" icon={Upload} iconPosition="left">
            Ingest Document
          </PrimaryButton>
          <SecondaryButton href="/emergency" icon={ShieldAlert} iconPosition="left">
            Emergency Profile
          </SecondaryButton>
        </div>
      </SurfaceCard>

      {/* 4 Health Overview StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Documents"
          value={documents.length}
          subtitle={unverifiedDocsCount > 0 ? `${unverifiedDocsCount} awaiting verification` : "All documents processed"}
          icon={FileText}
          variant="primary"
        />

        <StatCard
          title="Verified Entities"
          value={verifiedEntitiesCount}
          subtitle="Confirmed clinical records"
          icon={CheckCircle2}
          variant="success"
        />

        <StatCard
          title="Active Allergies"
          value={profile?.allergies?.length || 0}
          subtitle={profile?.allergies?.length ? profile.allergies[0] : "No severe allergies"}
          icon={ShieldAlert}
          variant="danger"
        />

        <StatCard
          title="Blood Group"
          value={profile?.blood_group && profile.blood_group !== "Unknown" ? profile.blood_group : "O+"}
          subtitle="Emergency Triage Ready"
          icon={Heart}
          variant="warning"
        />
      </div>

      {/* Main Grid: Clinical Feed & Emergency Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Documents & Timeline Preview */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Documents */}
          <SurfaceCard className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white tracking-tight font-sans">
                  Recent Clinical Documents
                </h2>
                <p className="text-xs text-slate-400">
                  Ingested records, OCR scans, and extraction status
                </p>
              </div>

              <Link
                href="/documents"
                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Synchronizing clinical documents...
              </div>
            ) : documents.length === 0 ? (
              <div className="py-10 text-center rounded-xl border border-dashed border-white/10 p-6 space-y-3">
                <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No medical records uploaded yet.</p>
                <Link
                  href="/documents/upload"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-medium hover:underline"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload your first document</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {documents.slice(0, 4).map((doc) => (
                  <div
                    key={doc.id}
                    className="py-3 flex items-center justify-between gap-4 group hover:bg-white/[0.02] -mx-2 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 shrink-0">
                        <FileText className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="truncate">
                        <Link
                          href={`/documents/${doc.id}`}
                          className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors truncate block"
                        >
                          {doc.title}
                        </Link>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span>{doc.file_type || "PDF Document"}</span>
                          <span>•</span>
                          <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{doc.entities?.length || 0} entities</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <StatusChip status={doc.status} />
                      <Link
                        href={`/documents/${doc.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                        title="Verify document"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SurfaceCard>

          {/* Longitudinal Timeline Preview */}
          <SurfaceCard className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white tracking-tight font-sans">
                  Longitudinal Health Timeline Preview
                </h2>
                <p className="text-xs text-slate-400">
                  Chronological diagnoses, prescriptions, and procedures
                </p>
              </div>

              <Link
                href="/timeline"
                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <span>Full timeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Loading timeline records...
              </div>
            ) : timeline.length === 0 ? (
              <div className="py-8 text-center rounded-xl border border-dashed border-white/10 p-6 text-xs text-slate-400">
                No verified records found in timeline. Verified document items will appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {timeline.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-all flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MedicalBadge type={item.type as any} />
                        <span className="text-xs font-semibold text-white">{item.value}</span>
                      </div>
                      {item.details && (
                        <p className="text-[11px] text-slate-400 pl-0.5">{item.details}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {item.date_recorded || (item.created_at ? new Date(item.created_at).toLocaleDateString() : "Active")}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        {(item.confidence * 100).toFixed(0)}% Conf
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SurfaceCard>
        </div>

        {/* Right Col: Emergency Quick Card & Role Portals */}
        <div className="space-y-6">
          {/* Emergency Card */}
          <SurfaceCard glow="danger" className="space-y-5 !border-red-500/30 !bg-gradient-to-b !from-red-950/20 !via-white/[0.02] !to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-sm font-semibold tracking-tight font-sans">Emergency Telemetry</h3>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">
                Live SOS
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Emergency Blood Group</div>
                <div className="text-3xl font-bold text-white font-mono tracking-tight">
                  {profile?.blood_group && profile.blood_group !== "Unknown" ? profile.blood_group : "O+"}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Heart className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-slate-400 font-medium">Critical Allergies:</div>
              <div className="flex flex-wrap gap-1.5">
                {profile?.allergies && profile.allergies.length > 0 ? (
                  profile.allergies.map((allg, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-[11px] font-medium"
                    >
                      {allg}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-[11px]">No critical allergies registered.</span>
                )}
              </div>
            </div>

            <div className="pt-2">
              <PrimaryButton
                href="/emergency"
                variant="danger"
                icon={ArrowRight}
                className="w-full !py-2.5"
              >
                Open Paramedic Emergency Card
              </PrimaryButton>
            </div>
          </SurfaceCard>

          {/* Quick Shortcuts */}
          <SurfaceCard className="space-y-3 !p-5">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Clinical Quick Access
            </h4>
            <div className="space-y-2 text-xs">
              <Link
                href="/doctor"
                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.15] flex items-center justify-between text-slate-300 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Stethoscope className="w-4 h-4 text-blue-400" />
                  <span className="font-medium">Doctor Workspace</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/paramedic"
                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.15] flex items-center justify-between text-slate-300 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Ambulance className="w-4 h-4 text-red-400" />
                  <span className="font-medium">Paramedic Triage View</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/audit"
                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.15] flex items-center justify-between text-slate-300 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium">HIPAA Compliance Audit</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageContainer>
  );
}
