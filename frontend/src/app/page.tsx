"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { GlassNavbar } from "@/components/ui/GlassNavbar";
import { StatCard } from "@/components/ui/StatCard";
import { MedicalBadge } from "@/components/ui/MedicalBadge";
import { StatusChip } from "@/components/ui/StatusChip";
import {
  HeartPulse,
  ArrowRight,
  Shield,
  ShieldCheck,
  Activity,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Ambulance,
  Lock,
  Cpu,
  Database,
  Eye,
  Layers,
  Sparkles,
  PhoneCall,
  QrCode,
  Flame,
  ChevronRight,
  Zap,
  Check
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "extraction" | "emergency">("overview");
  const [demoVerified, setDemoVerified] = useState(false);
  const [sosDemoTriggered, setSosDemoTriggered] = useState(false);

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 selection:bg-blue-600 selection:text-white flex flex-col overflow-x-hidden">
      {/* 1. Frosted Glass Navigation */}
      <GlassNavbar variant="public" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Micro pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] backdrop-blur-md text-xs font-medium text-slate-300"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              MedSync Clinical Intelligence
            </span>
            <span className="text-white/20">•</span>
            <span className="text-blue-400 font-semibold">PostgreSQL & PaddleOCR</span>
          </motion.div>

          {/* Large confident typography */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] font-sans"
          >
            Longitudinal health records,{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-white bg-clip-text text-transparent">
              distilled by clinical intelligence.
            </span>
          </motion.h1>

          {/* Confident subtext with generous spacing */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            MedSync synthesizes unstructured clinical scans, handwritten prescriptions, and
            diagnostic reports into an immutable longitudinal timeline and instant 5-second paramedic dispatch.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href={user ? "/dashboard" : "/login"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 border border-blue-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{user ? "Enter Clinical OS" : "Launch Clinical OS"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#preview"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold border border-white/[0.1] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Interactive Interface</span>
            </a>
          </motion.div>

          {/* Value metrics strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-white/[0.06]"
          >
            <div className="space-y-1 text-center">
              <div className="text-xl font-bold text-white font-mono">300 DPI</div>
              <div className="text-[11px] text-slate-500">PyMuPDF Rasterizer</div>
            </div>
            <div className="space-y-1 text-center">
              <div className="text-xl font-bold text-emerald-400 font-mono">&lt; 5s</div>
              <div className="text-[11px] text-slate-500">Paramedic Triage</div>
            </div>
            <div className="space-y-1 text-center">
              <div className="text-xl font-bold text-white font-mono">PaddleOCR</div>
              <div className="text-[11px] text-slate-500">Zero-Mock Pipeline</div>
            </div>
            <div className="space-y-1 text-center">
              <div className="text-xl font-bold text-blue-400 font-mono">100%</div>
              <div className="text-[11px] text-slate-500">PostgreSQL Sovereignty</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Interactive Product Preview (Using existing UI components, NO IMAGES) */}
      <section id="preview" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive Operational Preview</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Designed for clinical precision
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Interact with the simulated MedSync workspace below. Switch views to explore health synthesis, document verification, and paramedic dispatch.
          </p>
        </div>

        {/* Clinical OS Window Mockup */}
        <div className="rounded-2xl border border-white/[0.1] bg-[#0A0E17]/90 backdrop-blur-2xl shadow-2xl shadow-black/80 overflow-hidden">
          {/* OS Window Chrome Header */}
          <div className="px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-[11px] font-mono text-slate-400">
                medsync-os://production/patient-profile
              </span>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "overview"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Health Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("extraction")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "extraction"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                AI OCR Verification
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("emergency")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "emergency"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Paramedic Triage
              </button>
            </div>
          </div>

          {/* Window Body */}
          <div className="p-6 md:p-8 min-h-[460px] bg-gradient-to-b from-white/[0.02] to-transparent">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      title="Medical Records"
                      value={12}
                      subtitle="All documents verified"
                      icon={FileText}
                      variant="primary"
                    />
                    <StatCard
                      title="Confirmed Diagnoses"
                      value={5}
                      subtitle="Longitudinal history"
                      icon={CheckCircle2}
                      variant="success"
                    />
                    <StatCard
                      title="Critical Allergies"
                      value={2}
                      subtitle="Penicillin & Sulfa"
                      icon={AlertTriangle}
                      variant="danger"
                    />
                    <StatCard
                      title="Blood Group"
                      value="O+"
                      subtitle="Emergency Card Active"
                      icon={HeartPulse}
                      variant="warning"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-white">
                        <span>Verified Longitudinal Events</span>
                        <span className="text-emerald-400 font-mono">100% Verified</span>
                      </div>
                      <div className="space-y-2.5">
                        <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <MedicalBadge type="diagnosis" />
                            <span className="font-semibold text-slate-200">Acute Bronchitis (J20.9)</span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">96% Conf</span>
                        </div>
                        <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <MedicalBadge type="medication" />
                            <span className="font-semibold text-slate-200">Amoxicillin 500mg TID</span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">94% Conf</span>
                        </div>
                        <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <MedicalBadge type="allergy" />
                            <span className="font-semibold text-red-300">Penicillin (Severe)</span>
                          </div>
                          <span className="text-[11px] font-mono text-red-400 font-semibold">Critical</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-white">
                        <span>First Responder Telemetry</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold">
                          READY
                        </span>
                      </div>
                      <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-red-300 font-bold">Emergency Card Profile</span>
                          <span className="text-2xl font-black font-mono text-white">O+</span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Primary Emergency Contact: Sarah Mercer (+1 555-987-6543)
                        </p>
                        <div className="text-[10px] text-slate-400">
                          Digital QR badge linked to real-time paramedic telemetry.
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "extraction" && (
                <motion.div
                  key="extraction"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {/* Left: Raw OCR stream */}
                  <div className="p-5 rounded-2xl border border-white/[0.08] bg-black/40 space-y-3 font-mono">
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/[0.06] pb-2">
                      <span className="flex items-center gap-1.5 text-blue-400">
                        <Cpu className="w-3.5 h-3.5" />
                        PaddleOCR Raw Stream
                      </span>
                      <span className="text-[10px] text-emerald-400">PyMuPDF 300DPI</span>
                    </div>
                    <div className="text-[11px] text-slate-300 leading-relaxed space-y-2">
                      <p className="text-slate-400">[PAGE 1 / DISCHARGE SUMMARY]</p>
                      <p>PATIENT: Alex Mercer | DOB: 1988-04-12 | MRN: #49201</p>
                      <p className="bg-blue-500/10 text-blue-300 p-1 rounded">
                        PRIMARY DIAGNOSIS: Acute Bronchitis with wheezing (ICD-10 J20.9).
                      </p>
                      <p className="bg-indigo-500/10 text-indigo-300 p-1 rounded">
                        RX: Amoxicillin 500mg PO TID x 10 days. Albuterol inhaler PRN.
                      </p>
                      <p className="bg-red-500/10 text-red-300 p-1 rounded font-bold">
                        ALERT: Known severe anaphylaxis to Penicillin. Withhold beta-lactams.
                      </p>
                    </div>
                  </div>

                  {/* Right: AI Extraction & Verification */}
                  <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-white">
                        Structured Medical Entities
                      </div>
                      <StatusChip status={demoVerified ? "verified" : "unverified"} />
                    </div>

                    <div className="space-y-2">
                      <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">Acute Bronchitis</div>
                          <div className="text-[10px] text-slate-400">Diagnosis • ICD-10 J20.9</div>
                        </div>
                        <span className="text-xs font-mono text-emerald-400">96%</span>
                      </div>

                      <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">Amoxicillin 500mg</div>
                          <div className="text-[10px] text-slate-400">Medication • TID 10 Days</div>
                        </div>
                        <span className="text-xs font-mono text-emerald-400">94%</span>
                      </div>

                      <div className="p-3 rounded-xl border border-red-500/30 bg-red-950/20 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-red-300">Penicillin Allergy</div>
                          <div className="text-[10px] text-red-400">Allergy • Anaphylaxis Contraindication</div>
                        </div>
                        <span className="text-xs font-mono text-red-400 font-bold">99%</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setDemoVerified(!demoVerified)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          demoVerified
                            ? "bg-emerald-600 text-white"
                            : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>
                          {demoVerified
                            ? "Entities Verified & Committed to Timeline"
                            : "Simulate Clinician Verification (Click to Approve)"}
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "emergency" && (
                <motion.div
                  key="emergency"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-surface-900/60 to-red-950/20 border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                        <Ambulance className="w-4 h-4" />
                        <span>5-Second Paramedic Triage View</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">Alex Mercer (Age 38)</h3>
                      <p className="text-xs text-slate-300">
                        GPS: 37.7749° N, 122.4194° W • High-Priority Allergic Distress
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1]">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Blood Group</div>
                        <div className="text-3xl font-black text-white font-mono">O+</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSosDemoTriggered(!sosDemoTriggered)}
                        className={`px-5 py-3 rounded-2xl font-bold text-xs shadow-lg transition-all ${
                          sosDemoTriggered
                            ? "bg-red-600 text-white animate-pulse"
                            : "bg-red-500 hover:bg-red-400 text-white"
                        }`}
                      >
                        {sosDemoTriggered ? "BEACON BROADCASTING" : "TEST DISTRESS TRIGGER"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/10 space-y-1">
                      <div className="text-[11px] text-red-400 font-bold uppercase">Severe Allergies</div>
                      <div className="text-sm font-bold text-white">Penicillin, Sulfa, Latex</div>
                      <div className="text-[10px] text-red-300">Anaphylaxis hazard</div>
                    </div>
                    <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-1">
                      <div className="text-[11px] text-slate-400 font-semibold uppercase">Chronic Conditions</div>
                      <div className="text-sm font-bold text-white">Type 2 Diabetes, HTN</div>
                      <div className="text-[10px] text-slate-400">Metformin 500mg daily</div>
                    </div>
                    <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-1">
                      <div className="text-[11px] text-slate-400 font-semibold uppercase">Emergency Contact</div>
                      <div className="text-sm font-bold text-white">Sarah Mercer (Spouse)</div>
                      <div className="text-[10px] text-blue-400 font-mono">+1 (555) 987-6543</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 4. Feature Grid - Minimal luxurious cards */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-3 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-slate-400">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Architecture & Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Engineered for high-stakes clinical workflows
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            From rasterization to first-responder dispatch, MedSync bridges the gap between disparate paper records and emergency care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Cpu,
              title: "PaddleOCR + PyMuPDF Extraction",
              desc: "Native rasterization at 300 DPI paired with neural text detection. No third-party cloud OCR leaks or vendor lock-in.",
              tag: "Local AI Pipeline",
            },
            {
              icon: Activity,
              title: "Unified Longitudinal Graph",
              desc: "Transforms fragmented lab slips and discharge summaries into a verified, queryable clinical timeline of diagnoses and medications.",
              tag: "Health Synthesis",
            },
            {
              icon: Ambulance,
              title: "5-Second Paramedic Triage",
              desc: "High-contrast emergency beacon displaying critical blood group, life-threatening allergies, and tap-to-call family contacts in seconds.",
              tag: "Emergency Dispatch",
            },
            {
              icon: Stethoscope,
              title: "Multi-Role RBAC & Workspaces",
              desc: "Segregated portals for Patients, Attending Physicians, Paramedic Responders, and Compliance Administrators.",
              tag: "Access Control",
            },
            {
              icon: ShieldCheck,
              title: "Immutable HIPAA Audit Trail",
              desc: "Every record view, prescription verification, and doctor intervention is permanently logged with IP addresses and actor identity.",
              tag: "Compliance Ledger",
            },
            {
              icon: CheckCircle2,
              title: "Clinician-in-the-Loop Verification",
              desc: "Split-screen review software with side-by-side PDF preview, extracted entity confidence scoring, and one-click timeline commit.",
              tag: "Confidence Scoring",
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="group relative p-7 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.16] transition-all duration-300 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:border-blue-500/30 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                    {feature.tag}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. 3-Step Workflow Section */}
      <section id="workflow" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/[0.06]">
        <div className="text-center space-y-3 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-slate-400">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Operational Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            How MedSync processes clinical data
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            From raw paper documentation to life-saving emergency dispatch in three verifiable steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {[
            {
              step: "01",
              title: "Ingest & Rasterize",
              desc: "Upload multi-page PDFs, hospital discharge summaries, or camera photos. PyMuPDF renders pages at 300 DPI for high-fidelity OCR reading.",
              badge: "PyMuPDF + Pillow",
            },
            {
              step: "02",
              title: "Neural Extraction",
              desc: "PaddleOCR isolates coordinate text blocks. OpenAI Responses model classifies entities into diagnoses, medications, allergies, and lab results.",
              badge: "PaddleOCR + LLM",
            },
            {
              step: "03",
              title: "Longitudinal Synthesis",
              desc: "Verified clinical records update the patient's continuous timeline graph and immediately prime the paramedic emergency beacon.",
              badge: "PostgreSQL Ledger",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-5 relative group hover:border-white/[0.15] transition-all"
            >
              <div className="text-4xl font-black font-mono text-white/20 group-hover:text-blue-500/40 transition-colors">
                {item.step}
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                  {item.badge}
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight pt-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Privacy & Security Section */}
      <section id="security" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/[0.06]">
        <div className="rounded-3xl border border-white/[0.1] bg-gradient-to-b from-white/[0.04] to-transparent p-8 md:p-14 space-y-10">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sovereign Health Security</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Clinical privacy with Zero Vendor Leakage
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Medical records belong to the patient and their authorized clinical team. MedSync is built on an isolated PostgreSQL relational architecture with role-based access control.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <Lock className="w-5 h-5 text-blue-400" />
              <h4 className="text-sm font-semibold text-white">End-to-End Cryptography</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Password hashing via bcrypt, stateless JWT sessions, and HTTPS transport isolation.
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <Database className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-semibold text-white">PostgreSQL Sovereignty</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Relational schema with strict cascading deletes, foreign keys, and zero mock storage.
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <Eye className="w-5 h-5 text-indigo-400" />
              <h4 className="text-sm font-semibold text-white">Immutable HIPAA Ledger</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every access by doctors, paramedics, and administrators is permanently audited.
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <Shield className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-semibold text-white">Strict Granular RBAC</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paramedics only receive emergency profiles; doctors only view authorized clinical charts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="mt-auto border-t border-white/[0.07] bg-[#05070C] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <HeartPulse className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white">MedSync Clinical OS</span>
            <span className="text-xs text-slate-500">
              • Longitudinal Health Intelligence & Emergency Dispatch
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/emergency" className="hover:text-white transition-colors">
              Emergency Card
            </Link>
            <Link href="/audit" className="hover:text-white transition-colors">
              Audit Ledger
            </Link>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500 font-mono text-[11px]">
              HIPAA Compliant Architecture
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
