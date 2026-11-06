"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  HeartPulse,
  Lock,
  Mail,
  User,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Stethoscope,
  Ambulance,
  Shield,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"patient" | "doctor" | "paramedic" | "admin">("patient");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, fullName, role);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  }

  function handleQuickFill(targetEmail: string, targetPass: string = "password123") {
    setEmail(targetEmail);
    setPassword(targetPass);
    setMode("login");
    setErrorMsg("");
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-panel relative z-10 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/10 space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-primary-500/25 ring-4 ring-primary-500/20">
            <HeartPulse className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {mode === "login" ? "Sign In to MedSync" : "Create MedSync Account"}
          </h1>
          <p className="text-xs text-slate-400">
            Secure clinical record management & instant emergency telemetry
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-surface-900/80 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg("");
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "login"
                ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg("");
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "register"
                ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 rounded-xl bg-danger-500/10 border border-danger-500/30 text-danger-300 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-danger-400" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Eleanor Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-900/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Clinical Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "patient", label: "Patient", icon: User },
                    { id: "doctor", label: "Doctor", icon: Stethoscope },
                    { id: "paramedic", label: "Paramedic", icon: Ambulance },
                    { id: "admin", label: "Admin", icon: Shield },
                  ].map((r) => {
                    const Icon = r.icon;
                    const isSelected = role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id as any)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-primary-600/20 border-primary-500 text-primary-300 ring-1 ring-primary-500"
                            : "bg-surface-900/40 border-white/5 text-slate-400 hover:text-white hover:border-white/15"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@medsync.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-900/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-900/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-500 active:scale-[0.99] text-white text-xs font-semibold shadow-lg shadow-primary-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : mode === "login" ? "Sign In" : "Create Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access Switcher */}
        <div className="pt-2 border-t border-white/5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary-400" />
              Quick Demo Accounts
            </span>
            <span className="text-[10px] text-slate-500">Click to auto-fill</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { role: "Patient", email: "patient@medsync.io", desc: "EHR & SOS" },
              { role: "Doctor", email: "doctor@medsync.io", desc: "Clinical notes" },
              { role: "Paramedic", email: "paramedic@medsync.io", desc: "Triage & triage" },
              { role: "Admin", email: "admin@medsync.io", desc: "Audit & logs" },
            ].map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleQuickFill(acc.email)}
                className="p-2 rounded-xl bg-surface-900/60 border border-white/5 hover:border-primary-500/40 hover:bg-primary-950/20 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-primary-300">
                    {acc.role}
                  </span>
                  <CheckCircle2 className="w-3 h-3 text-slate-600 group-hover:text-primary-400 transition-colors" />
                </div>
                <div className="text-[10px] text-slate-400 truncate">{acc.email}</div>
              </button>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-surface-900/40 border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="text-slate-500">Default Demo Password:</span>
            <span className="font-mono text-slate-300 bg-surface-800 px-2 py-0.5 rounded text-[10px]">
              password123
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
