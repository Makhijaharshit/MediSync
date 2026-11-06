"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, AlertTriangle, CheckCircle2, X, MapPin, Loader2 } from "lucide-react";
import { api, EmergencyEvent } from "@/lib/api";

interface SOSButtonProps {
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
  activeSOS?: EmergencyEvent | null;
  onSOSCreated?: (event: EmergencyEvent) => void;
  onSOSResolved?: () => void;
}

export const SOSButton: React.FC<SOSButtonProps> = ({
  size = "md",
  className = "",
  activeSOS,
  onSOSCreated,
  onSOSResolved,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [locationName, setLocationName] = useState("Detected GPS Location (Hospital / Home)");
  const [errorMsg, setErrorMsg] = useState("");

  const isTriggered = !!activeSOS && activeSOS.status === "active";

  async function handleTrigger() {
    try {
      setLoading(true);
      setErrorMsg("");

      // Attempt geolocation if available
      let lat: number | undefined = undefined;
      let lng: number | undefined = undefined;

      if ("geolocation" in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {
          lat = 28.6139;
          lng = 77.2090;
        }
      }

      const res = await api.emergency.triggerSOS({
        latitude: lat,
        longitude: lng,
        location_name: locationName,
        notes: notes.trim() || "Emergency distress beacon triggered by patient/bystander.",
      });

      if (onSOSCreated) {
        onSOSCreated(res);
      }
      setModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to trigger SOS broadcast.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve() {
    if (!activeSOS) return;
    try {
      setLoading(true);
      await api.emergency.resolveEvent(activeSOS.id);
      if (onSOSResolved) {
        onSOSResolved();
      }
      setModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resolve SOS beacon.");
    } finally {
      setLoading(false);
    }
  }

  if (size === "sm") {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className={`relative group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
            isTriggered
              ? "bg-rose-600 text-white animate-pulse shadow-glow-rose ring-2 ring-rose-400"
              : "bg-rose-600/90 hover:bg-rose-600 text-white hover:shadow-glow-rose"
          } ${className}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{isTriggered ? "BEACON ACTIVE" : "SOS BEACON"}</span>
        </button>

        <SOSModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          isTriggered={isTriggered}
          activeSOS={activeSOS}
          notes={notes}
          setNotes={setNotes}
          locationName={locationName}
          setLocationName={setLocationName}
          loading={loading}
          errorMsg={errorMsg}
          onTrigger={handleTrigger}
          onResolve={handleResolve}
        />
      </>
    );
  }

  if (size === "hero") {
    return (
      <>
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="relative">
            {/* Pulsing ring outer */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className={`absolute -inset-4 rounded-full blur-xl ${
                isTriggered ? "bg-rose-600/50" : "bg-rose-500/30"
              }`}
            />

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setModalOpen(true)}
              className={`relative z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center gap-2.5 text-white font-black tracking-tight shadow-2xl transition-all border-4 ${
                isTriggered
                  ? "bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 border-rose-300 shadow-glow-rose ring-8 ring-rose-950/60"
                  : "bg-gradient-to-tr from-rose-700 via-red-600 to-rose-500 hover:from-rose-600 hover:to-red-500 border-white/20 shadow-2xl"
              }`}
            >
              <ShieldAlert className={`w-14 h-14 ${isTriggered ? "animate-bounce" : ""}`} />
              <div className="text-xl leading-none uppercase">
                {isTriggered ? "ACTIVE SOS" : "TRIGGER SOS"}
              </div>
              <div className="text-[10px] font-bold tracking-widest text-rose-200/90 uppercase">
                {isTriggered ? "Dispatch In Progress" : "Instant Paramedic Alert"}
              </div>
            </motion.button>
          </div>

          <p className="text-xs text-slate-400 max-w-sm">
            {isTriggered
              ? "Live distress beacon is broadcasting your critical EHR profile & GPS coordinates to connected paramedics."
              : "Pressing SOS broadcasts your blood group, critical allergies, medication list, and location to emergency responders."}
          </p>
        </div>

        <SOSModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          isTriggered={isTriggered}
          activeSOS={activeSOS}
          notes={notes}
          setNotes={setNotes}
          locationName={locationName}
          setLocationName={setLocationName}
          loading={loading}
          errorMsg={errorMsg}
          onTrigger={handleTrigger}
          onResolve={handleResolve}
        />
      </>
    );
  }

  // Default md size
  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 text-white shadow-md transition-all ${
          isTriggered
            ? "bg-rose-600 animate-pulse shadow-glow-rose ring-2 ring-rose-400"
            : "bg-rose-600 hover:bg-rose-500 shadow-rose-950/40 hover:shadow-glow-rose"
        } ${className}`}
      >
        <ShieldAlert className="w-4 h-4" />
        <span>{isTriggered ? "Emergency Distress Active" : "Trigger Emergency SOS"}</span>
      </button>

      <SOSModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isTriggered={isTriggered}
        activeSOS={activeSOS}
        notes={notes}
        setNotes={setNotes}
        locationName={locationName}
        setLocationName={setLocationName}
        loading={loading}
        errorMsg={errorMsg}
        onTrigger={handleTrigger}
        onResolve={handleResolve}
      />
    </>
  );
};

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  isTriggered: boolean;
  activeSOS?: EmergencyEvent | null;
  notes: string;
  setNotes: (s: string) => void;
  locationName: string;
  setLocationName: (s: string) => void;
  loading: boolean;
  errorMsg: string;
  onTrigger: () => void;
  onResolve: () => void;
}

const SOSModal: React.FC<SOSModalProps> = ({
  isOpen,
  onClose,
  isTriggered,
  activeSOS,
  notes,
  setNotes,
  locationName,
  setLocationName,
  loading,
  errorMsg,
  onTrigger,
  onResolve,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-left space-y-5"
        >
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-2xl ${
                  isTriggered ? "bg-rose-500/20 text-rose-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isTriggered ? "Active Distress Signal" : "Dispatch Emergency SOS"}
                </h3>
                <p className="text-xs text-slate-400">
                  {isTriggered
                    ? "Beacon currently broadcasting to paramedic units."
                    : "Instantly alert responders with your critical clinical data."}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isTriggered ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  <span>TRANSMITTING EMERGENCY BEACON</span>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div>
                    <span className="text-slate-500">Location:</span>{" "}
                    {activeSOS?.location_name || "Emergency Location"}
                  </div>
                  <div>
                    <span className="text-slate-500">Coordinates:</span>{" "}
                    {activeSOS?.latitude}, {activeSOS?.longitude}
                  </div>
                  <div>
                    <span className="text-slate-500">Triggered At:</span>{" "}
                    {activeSOS?.triggered_at ? new Date(activeSOS.triggered_at).toLocaleTimeString() : "Just now"}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={onResolve}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Resolve & Cancel Distress</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Location / Landmarks
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Terminal 2, Central Station, Home"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Urgent Clinical Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Experiencing chest tightness, conscious, severe bee sting"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/50 flex items-start gap-2.5 text-[11px] text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  This broadcasts your registered emergency profile (blood group, allergies, active prescriptions) and coordinates immediately.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onTrigger}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-glow-rose transition-all flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                  <span>Broadcast Distress Beacon</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
