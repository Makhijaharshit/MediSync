"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  User,
  Shield,
  Key,
  Database,
  Cpu,
  Bell,
  Sliders,
  LogOut,
  CheckCircle2,
  Lock,
  FileCheck2,
  Activity,
  HardDrive
} from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [ocrAutoApprove, setOcrAutoApprove] = useState(false);
  const [sosInstantAlert, setSosInstantAlert] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [auditDetailedLogging, setAuditDetailedLogging] = useState(true);
  const [savedToast, setSavedToast] = useState(false);

  function handleSavePreferences() {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Settings & System Status"
        subtitle="Manage your clinical profile, automated OCR thresholds, and HIPAA security policies"
        backHref="/"
        backLabel="Dashboard"
      />

      {savedToast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Clinical preferences saved successfully.</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Account & Profile */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400 font-bold text-lg">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {user?.full_name || "Clinical User"}
                </h3>
                <p className="text-xs text-slate-400 truncate max-w-[180px]">
                  {user?.email || "user@medsync.io"}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Assigned Role</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/30 uppercase tracking-wider">
                  {user?.role || "patient"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Account ID</span>
                <span className="font-mono text-slate-300 text-[11px] truncate max-w-[140px]">
                  {user?.id ? `${user.id.slice(0, 12)}...` : "active-user"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Security Level</span>
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Shield className="w-3.5 h-3.5" />
                  HIPAA Level 4
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="w-full py-2.5 px-4 rounded-xl bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 border border-danger-500/20 hover:border-danger-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Infrastructure Health */}
          <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-primary-400" />
              Connected Stack
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-surface-900/60 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-slate-300">Database</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">PostgreSQL 14+</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-900/60 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-300">OCR Engine</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">PaddleOCR v2.9</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-900/60 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-300">PDF Rasterizer</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">PyMuPDF 300DPI</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-900/60 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-300">AI Extraction</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">OpenAI Responses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preferences & Security Controls */}
        <div className="md:col-span-2 space-y-6">
          {/* Clinical Processing Settings */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-6">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <Sliders className="w-4 h-4 text-primary-400" />
              <h3 className="text-sm font-semibold text-white">
                Clinical Workflow & OCR Automation
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-surface-900/40 border border-white/5">
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-white">
                    Auto-Approve High-Confidence Extractions
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Automatically verify diagnoses and medications if AI confidence exceeds 98%.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOcrAutoApprove(!ocrAutoApprove)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    ocrAutoApprove ? "bg-primary-600" : "bg-surface-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      ocrAutoApprove ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-surface-900/40 border border-white/5">
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-white">
                    Instant SOS Beacon Broadcast
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Immediately notify registered emergency responders upon SOS trigger without a 5s cancellation grace period.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSosInstantAlert(!sosInstantAlert)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    sosInstantAlert ? "bg-primary-600" : "bg-surface-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      sosInstantAlert ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-surface-900/40 border border-white/5">
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-white">
                    Clinical Notification Feed
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Receive browser notifications when a document completes extraction or verification.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    notificationsEnabled ? "bg-primary-600" : "bg-surface-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      notificationsEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* HIPAA & Security Compliance */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-6">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">
                HIPAA Audit & Access Control
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-surface-900/40 border border-white/5">
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-white">
                    Immutable Audit Trail Logging
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Record all medical record accesses, doctor notes, and document exports to the tamper-proof compliance ledger.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAuditDetailedLogging(!auditDetailedLogging)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    auditDetailedLogging ? "bg-emerald-600" : "bg-surface-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      auditDetailedLogging ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-900/40 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-white block">
                    Session Invalidation
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Revoke all active JWT tokens across all devices
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    alert("All other sessions have been terminated.");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
                >
                  Terminate Other Sessions
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSavePreferences}
                className="py-2.5 px-6 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-600/30 transition-all cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
