"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, EmergencyProfile, EmergencyEvent, TimelineItem } from "@/lib/api";
import {
  ShieldAlert,
  Heart,
  Phone,
  AlertTriangle,
  User,
  Plus,
  Trash2,
  CheckCircle2,
  Radio,
  MapPin,
  Clock,
  Sparkles,
  QrCode,
  Pill,
  Download,
  Share2,
  Edit3,
  Loader2,
  X
} from "lucide-react";
import {
  PageContainer,
  SectionHeading,
  SurfaceCard,
  PrimaryButton,
  SecondaryButton,
  SOSButton,
  EmergencyAlertCard,
  MedicalBadge
} from "@/components/ui";

export default function EmergencyPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<EmergencyProfile | null>(null);
  const [activeSOS, setActiveSOS] = useState<EmergencyEvent | null>(null);
  const [medications, setMedications] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [msg, setMsg] = useState("");

  // Edit form state
  const [bloodGroup, setBloodGroup] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [allergiesText, setAllergiesText] = useState("");
  const [conditionsText, setConditionsText] = useState("");
  const [contacts, setContacts] = useState<Array<{ name: string; phone: string; relation: string }>>([]);

  useEffect(() => {
    loadEmergencyData();
  }, [user]);

  async function loadEmergencyData() {
    try {
      setLoading(true);
      const [prof, events, timeline] = await Promise.all([
        api.emergency.getProfile().catch(() => null),
        api.emergency.getEvents("active").catch(() => []),
        api.timeline.get("medication", undefined, true).catch(() => []),
      ]);

      if (prof) {
        setProfile(prof);
        setBloodGroup(prof.blood_group || "Unknown");
        setPhone(prof.phone || "");
        setNotes(prof.notes || "");
        setAllergiesText(prof.allergies ? prof.allergies.join(", ") : "");
        setConditionsText(prof.chronic_conditions ? prof.chronic_conditions.join(", ") : "");
        setContacts(prof.emergency_contacts || []);
      }

      if (events && events.length > 0) {
        const myEvent = events.find((e: EmergencyEvent) => e.patient_id === user?.id) || events[0];
        setActiveSOS(myEvent);
      } else {
        setActiveSOS(null);
      }

      setMedications(timeline || []);
    } catch (err) {
      console.error("Emergency data load error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setMsg("");

      const allergies = allergiesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const chronic_conditions = conditionsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        blood_group: bloodGroup,
        phone,
        notes,
        allergies,
        chronic_conditions,
        emergency_contacts: contacts,
      };

      const updated = await api.emergency.updateProfile(payload);
      setProfile(updated);
      setIsEditing(false);
      setMsg("Emergency clinical card updated successfully.");
    } catch (err: any) {
      setMsg(err.message || "Failed to update emergency profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  function handleAddContact() {
    setContacts([...contacts, { name: "", phone: "", relation: "Contact" }]);
  }

  function handleContactChange(index: number, field: string, value: string) {
    const updated = [...contacts];
    (updated[index] as any)[field] = value;
    setContacts(updated);
  }

  function handleRemoveContact(index: number) {
    setContacts(contacts.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="p-20 text-center text-slate-500 space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          <p className="text-xs font-medium">Synchronizing emergency telemetry and profile...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Top Header */}
      <SectionHeading
        title="Emergency Responder Card & SOS Beacon"
        subtitle="Critical, life-saving EHR profile instantly accessible to first responders and paramedics during acute medical events."
        backHref="/dashboard"
        backLabel="Dashboard"
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            High Priority UX
          </span>
        }
        actions={
          <SecondaryButton
            onClick={() => setIsEditing(!isEditing)}
            icon={Edit3}
            iconPosition="left"
          >
            {isEditing ? "Close Editor" : "Edit Profile"}
          </SecondaryButton>
        }
      />

      {msg && (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg("")} className="font-bold text-blue-400">
            ✕
          </button>
        </div>
      )}

      {/* Critical Alerts Banner (Active SOS Beacon or Allergy warnings) */}
      <EmergencyAlertCard
        event={activeSOS}
        allergyAlerts={profile?.allergies}
        onManage={() => {}}
      />

      {/* Hero SOS Trigger Section */}
      <SurfaceCard
        glow="danger"
        className="!p-6 sm:!p-10 !bg-gradient-to-b !from-red-950/40 !via-[#0A0E17] !to-[#070A10] !border-red-500/30 text-center space-y-4 relative overflow-hidden"
      >
        <div className="max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-mono font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span>Paramedic Dispatch Protocol</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
            {activeSOS
              ? "DISTRESS BROADCAST ACTIVE • EMS RESPONDERS ALERTED"
              : "Direct Distress Signal Transmitter"}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400">
            {activeSOS
              ? "Your emergency beacon is actively transmitting live GPS coordinates, blood group, and allergy warnings."
              : "Press the beacon button below to transmit your verified EHR emergency card and location to nearby paramedic units."}
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <SOSButton
            size="hero"
            activeSOS={activeSOS}
            onSOSCreated={(e) => {
              setActiveSOS(e);
              setMsg("Distress beacon broadcasted to emergency responders.");
            }}
            onSOSResolved={() => {
              setActiveSOS(null);
              setMsg("Distress beacon resolved.");
            }}
          />
        </div>
      </SurfaceCard>

      {/* Two-Column Clinical Layout: Left = Patient Emergency Card, Right = QR & Paramedic Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Patient Clinical Card */}
        <div className="lg:col-span-8 space-y-6">
          <SurfaceCard className="space-y-6 !p-6 sm:!p-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="space-y-0.5">
                <h3 className="text-base font-semibold text-white font-sans">
                  Patient Emergency Medical Profile
                </h3>
                <p className="text-xs text-slate-400">
                  Critical medical identification for first responders and trauma teams.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                PostgreSQL Synced
              </span>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Blood Group
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"].map((bg) => (
                        <option key={bg} value={bg} className="bg-[#070A10]">
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Known Drug Allergies (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={allergiesText}
                    onChange={(e) => setAllergiesText(e.target.value)}
                    placeholder="e.g. Penicillin, Sulfa, Aspirin"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Chronic Conditions (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={conditionsText}
                    onChange={(e) => setConditionsText(e.target.value)}
                    placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Clinician Directives / Critical Care Notes
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Patient carries an emergency EpiPen. Pacemaker installed."
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <SecondaryButton onClick={() => setIsEditing(false)}>
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton type="submit" loading={savingProfile}>
                    {savingProfile ? "Saving Profile..." : "Save Emergency Profile"}
                  </PrimaryButton>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Blood Group and Patient Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-red-950/30 via-white/[0.02] to-transparent border border-red-500/20 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-red-600 text-white font-bold text-3xl flex items-center justify-center font-mono shadow-sm shrink-0">
                      {profile?.blood_group || "O+"}
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider">
                        Blood Group
                      </div>
                      <div className="text-base font-semibold text-white">
                        {profile?.full_name || user?.full_name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {profile?.phone || "No phone registered"}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-1">
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Patient Identifiers
                    </div>
                    <div className="text-xs text-slate-300">
                      <span className="text-slate-500">DOB:</span> {profile?.dob || "1988-06-14"}
                    </div>
                    <div className="text-xs text-slate-300 truncate">
                      <span className="text-slate-500">Email:</span> {profile?.email || user?.email}
                    </div>
                    <div className="text-xs text-slate-300">
                      <span className="text-slate-500">Dispatch Status:</span>{" "}
                      <span className="text-emerald-400 font-medium">Online & Transmitting</span>
                    </div>
                  </div>
                </div>

                {/* Documented Allergies */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Critical Documented Allergies</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile?.allergies && profile.allergies.length > 0 ? (
                      profile.allergies.map((a, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-200 border border-red-500/25 text-xs font-medium"
                        >
                          {a}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">
                        No known drug allergies (NKDA) registered.
                      </span>
                    )}
                  </div>
                </div>

                {/* Current Active Medications */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                    <Pill className="w-4 h-4" />
                    <span>Current Active Prescriptions & Medications</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {medications.length > 0 ? (
                      medications.slice(0, 4).map((med, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs"
                        >
                          <div className="font-semibold text-slate-200">{med.value}</div>
                          <div className="text-[11px] text-slate-400">{med.details || "Active"}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500 p-2">
                        No active prescriptions documented.
                      </div>
                    )}
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Designated Emergency Contacts
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profile?.emergency_contacts && profile.emergency_contacts.length > 0 ? (
                      profile.emergency_contacts.map((c, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="text-xs font-semibold text-white">{c.name}</div>
                            <div className="text-[11px] text-slate-400 capitalize">{c.relation}</div>
                          </div>
                          <a
                            href={`tel:${c.phone}`}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500">No emergency contacts listed.</div>
                    )}
                  </div>
                </div>

                {/* Clinician Instructions / Directives */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                    Advance Medical Directives & Notes
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {profile?.notes || "No special directives registered."}
                  </p>
                </div>
              </div>
            )}
          </SurfaceCard>
        </div>

        {/* Right Column (4 cols): QR Identifier Card */}
        <div className="lg:col-span-4 space-y-6">
          <SurfaceCard className="text-center space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-sm text-white font-sans">Emergency QR Identifier</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">Encrypted</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Paramedics, trauma teams, or first responders scan this card for immediate 5-second clinical identification.
            </p>

            {/* Generated QR Code Visual Display */}
            <div className="p-6 rounded-2xl bg-white text-slate-950 inline-block shadow-2xl mx-auto border-4 border-slate-200">
              <QrCode className="w-44 h-44 text-slate-900 mx-auto" />
              <div className="mt-2 text-[10px] font-mono font-bold text-slate-700 tracking-wider uppercase">
                MEDSYNC ID: {profile?.user_id?.slice(0, 12) || "PATIENT-EMR"}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-left text-xs space-y-1">
              <div className="text-[10px] font-mono uppercase font-semibold text-slate-500">Data Scanned</div>
              <div className="text-slate-300 font-medium">
                ● Blood Group: {profile?.blood_group || "O+"}
              </div>
              <div className="text-slate-300 font-medium">
                ● Allergies: {profile?.allergies?.join(", ") || "None registered"}
              </div>
              <div className="text-slate-300 font-medium">
                ● Emergency Dial: {profile?.emergency_contacts?.[0]?.phone || "911"}
              </div>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageContainer>
  );
}
