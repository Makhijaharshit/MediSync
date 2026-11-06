"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, EmergencyEvent, EmergencyProfile } from "@/lib/api";
import {
  Radio,
  MapPin,
  Heart,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Search,
  Clock,
  ShieldAlert,
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

export default function ParamedicPortalPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EmergencyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [searchPatientId, setSearchPatientId] = useState("");
  const [searchedProfile, setSearchedProfile] = useState<EmergencyProfile | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadEvents() {
    try {
      const data = await api.emergency.getEvents();
      setEvents(data || []);
    } catch (err) {
      console.error("Paramedic events error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(eventId: string) {
    try {
      setResolvingId(eventId);
      await api.emergency.resolveEvent(eventId);
      setMsg("Distress beacon acknowledged and resolved.");
      await loadEvents();
    } catch (err: any) {
      setMsg(`Error resolving event: ${err.message}`);
    } finally {
      setResolvingId(null);
    }
  }

  async function handlePatientLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!searchPatientId.trim()) return;

    try {
      setSearchLoading(true);
      setSearchError("");
      setSearchedProfile(null);
      const prof = await api.emergency.getProfile(searchPatientId.trim());
      setSearchedProfile(prof);
    } catch (err: any) {
      setSearchError(err.message || "Patient emergency profile not found.");
    } finally {
      setSearchLoading(false);
    }
  }

  const activeEvents = events.filter((e) => e.status === "active");
  const pastEvents = events.filter((e) => e.status !== "active");

  return (
    <PageContainer maxWidth="wide">
      {/* Top Header */}
      <SectionHeading
        title="Paramedic & First Responder Dispatch Feed"
        subtitle="Ultra-high priority emergency console. Identify critical patient vitals within 5 seconds: Blood Group, Allergies, Active Prescriptions, and Direct Emergency Contacts."
        backHref="/dashboard"
        badge={
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
            <span>{activeEvents.length} Active Distress Beacons</span>
          </span>
        }
      />

      {msg && (
        <SurfaceCard glow="success" className="p-4 bg-emerald-950/40 border-emerald-800/60 text-emerald-300 text-xs flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg("")} className="font-bold text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </SurfaceCard>
      )}

      {/* Priority Incoming Distress Beacons */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-widest">
            Live Distress Beacons ({activeEvents.length})
          </h2>
        </div>

        {activeEvents.length === 0 ? (
          <SurfaceCard className="p-8 text-center space-y-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mx-auto animate-pulse" />
            <div className="text-sm font-semibold text-white">No active distress beacons</div>
            <p className="text-xs text-slate-400">All local dispatch zones report normal standby status.</p>
          </SurfaceCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeEvents.map((ev) => (
              <SurfaceCard
                key={ev.id}
                glow="danger"
                className="border-rose-500/40 bg-gradient-to-br from-rose-950/40 via-surface-card to-surface-card p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <h3 className="text-xl font-bold text-white tracking-tight">{ev.patient_name}</h3>
                      <span className="px-2.5 py-0.5 rounded-lg bg-rose-600 text-white font-mono font-black text-sm shadow-md">
                        {ev.patient_blood_group || "O+"}
                      </span>
                    </div>

                    <div className="text-xs text-rose-300 font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{ev.location_name || "Emergency Coordinates"}</span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      GPS: {ev.latitude?.toFixed(4)}, {ev.longitude?.toFixed(4)}
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white animate-pulse">
                    TRANSMITTING
                  </span>
                </div>

                {ev.notes && (
                  <div className="p-3.5 rounded-xl bg-surface-base/80 border border-rose-900/60 text-xs text-rose-200">
                    <strong className="text-white">Distress Note: </strong>
                    {ev.notes}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-rose-900/30">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Triggered: {new Date(ev.triggered_at).toLocaleTimeString()}</span>
                  </div>

                  <PrimaryButton
                    variant="emerald"
                    size="sm"
                    onClick={() => handleResolve(ev.id)}
                    loading={resolvingId === ev.id}
                    icon={CheckCircle2}
                  >
                    Mark Handled / Resolved
                  </PrimaryButton>
                </div>
              </SurfaceCard>
            ))}
          </div>
        )}
      </div>

      {/* 5-Second Rapid Clinical Identifier Lookup */}
      <SurfaceCard className="p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-clinical-blue uppercase tracking-wider flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span>Rapid 5-Second Emergency Lookup (Field QR / ID Scanner)</span>
          </div>
          <p className="text-xs text-slate-400">
            Scan wristband QR or enter patient ID to load high-contrast critical medical contraindications instantly.
          </p>
        </div>

        <form onSubmit={handlePatientLookup} className="flex gap-2 max-w-xl">
          <input
            type="text"
            placeholder="Enter Patient ID (e.g. 5601fbad-... or paste from QR)..."
            value={searchPatientId}
            onChange={(e) => setSearchPatientId(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-surface-base border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-clinical-blue"
          />
          <PrimaryButton
            type="submit"
            size="sm"
            loading={searchLoading}
          >
            Scan & Load Card
          </PrimaryButton>
        </form>

        {searchError && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
            {searchError}
          </div>
        )}

        {/* High-Contrast 5-Second Emergency Responder Card */}
        {searchedProfile && (
          <SurfaceCard glow="danger" className="border-rose-500/40 bg-gradient-to-br from-rose-950/20 via-surface-card to-surface-card p-6 sm:p-8 space-y-6 animate-in fade-in">
            {/* Massive Vitals Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase font-black tracking-widest text-slate-400">
                  CRITICAL TRAUMA IDENTIFIER
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {searchedProfile.full_name}
                </h2>
                <div className="text-sm font-mono text-slate-300">
                  DOB: {searchedProfile.dob || "1988-06-14"} • Phone: {searchedProfile.phone || "N/A"}
                </div>
              </div>

              {/* Massive Blood Group Display */}
              <div className="flex items-center gap-4 bg-rose-950/60 p-4 rounded-2xl border border-rose-800/80 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase font-bold text-rose-400 tracking-wider">
                    BLOOD GROUP
                  </div>
                  <div className="text-xs text-rose-200">Compat Check</div>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight px-3 py-1 rounded-xl bg-rose-600 shadow-glow-rose">
                  {searchedProfile.blood_group}
                </div>
              </div>
            </div>

            {/* Critical Allergies (Giant Red Alert Cards) */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Documented Critical Allergies & Adverse Reactions</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {searchedProfile.allergies.length > 0 ? (
                  searchedProfile.allergies.map((a, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-sm tracking-wide shadow-glow-rose"
                    >
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400 font-semibold">
                    No Known Drug Allergies (NKDA)
                  </span>
                )}
              </div>
            </div>

            {/* Chronic Medical Conditions */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Heart className="w-4 h-4" />
                <span>Documented Chronic Conditions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchedProfile.chronic_conditions.length > 0 ? (
                  searchedProfile.chronic_conditions.map((c, i) => (
                    <MedicalBadge key={i} variant="diagnosis">
                      {c}
                    </MedicalBadge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No chronic conditions recorded.</span>
                )}
              </div>
            </div>

            {/* Immediate Emergency Contacts (Giant Tap-to-Call Buttons) */}
            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                One-Tap Emergency Contacts
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchedProfile.emergency_contacts && searchedProfile.emergency_contacts.length > 0 ? (
                  searchedProfile.emergency_contacts.map((c, i) => (
                    <a
                      key={i}
                      href={`tel:${c.phone}`}
                      className="p-4 rounded-2xl bg-clinical-blue/20 hover:bg-clinical-blue/30 border border-clinical-blue/40 text-white flex items-center justify-between transition-all group"
                    >
                      <div>
                        <div className="font-bold text-sm text-white">{c.name}</div>
                        <div className="text-xs text-slate-400 capitalize">{c.relation}</div>
                      </div>
                      <div className="flex items-center gap-2 font-mono font-bold text-sm bg-clinical-blue text-white px-3 py-1.5 rounded-xl shadow-glow">
                        <Phone className="w-4 h-4" />
                        <span>{c.phone}</span>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="text-xs text-slate-500">No contacts listed.</div>
                )}
              </div>
            </div>

            {/* Directives / Trauma Notes */}
            {searchedProfile.notes && (
              <div className="p-4 rounded-2xl bg-surface-base border border-white/[0.08] text-xs text-slate-300">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Physician Directive
                </span>
                {searchedProfile.notes}
              </div>
            )}
          </SurfaceCard>
        )}
      </SurfaceCard>

      {/* Resolved Beacons History */}
      <SurfaceCard className="p-6 space-y-4">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Resolved Distress Archive ({pastEvents.length})</span>
        </h2>

        <div className="space-y-2">
          {pastEvents.slice(0, 5).map((ev) => (
            <div
              key={ev.id}
              className="p-3.5 rounded-xl bg-surface-base/60 border border-white/[0.05] flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-white">{ev.patient_name}</span>
                <span className="text-slate-400 ml-2">
                  • Resolved: {ev.resolved_at ? new Date(ev.resolved_at).toLocaleTimeString() : "Completed"}
                </span>
              </div>
              <StatusChip status="resolved" />
            </div>
          ))}

          {pastEvents.length === 0 && (
            <div className="text-xs text-slate-500 p-4 text-center">
              No previous emergency archive events.
            </div>
          )}
        </div>
      </SurfaceCard>
    </PageContainer>
  );
}
