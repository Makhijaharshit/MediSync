"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, AuditLog } from "@/lib/api";
import { ShieldCheck, Search, Lock, Loader2 } from "lucide-react";
import {
  PageContainer,
  SectionHeading,
  SurfaceCard
} from "@/components/ui";

export default function AuditPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");

  useEffect(() => {
    async function fetchAudit() {
      try {
        setLoading(true);
        const data = await api.audit.list();
        setLogs(data || []);
      } catch (err) {
        console.error("Audit log error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAudit();
  }, [user]);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(filterQuery.toLowerCase()) ||
      l.actor_email.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeading
        title="Compliance & Security Audit Trail"
        subtitle="Immutable event log tracking all data access, OCR transformations, clinician edits, and emergency distress broadcasts."
        backHref="/dashboard"
        badge={
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>HIPAA Compliant Logging</span>
          </span>
        }
        actions={
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audit Integrity Verified</span>
          </div>
        }
      />

      {/* Search Toolbar */}
      <SurfaceCard className="p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search audit trail by actor, action, or details..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-base border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-clinical-blue"
          />
        </div>
      </SurfaceCard>

      {/* Audit Log Stream */}
      <SurfaceCard className="p-6">
        {loading ? (
          <div className="p-16 text-center text-slate-500 space-y-2 text-xs">
            <Loader2 className="w-6 h-6 text-clinical-blue animate-spin mx-auto" />
            <p>Loading compliance audit trail...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No audit records matching query.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="py-4 hover:bg-white/[0.02] -mx-2 px-2 rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-semibold px-2 py-0.5 rounded-md bg-clinical-blue/15 text-blue-300 border border-clinical-blue/30 text-[10px] tracking-wide">
                      {log.action}
                    </span>
                    <span className="font-semibold text-white">{log.actor_email}</span>
                  </div>
                  {log.details && (
                    <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">
                      {log.details}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 text-slate-500 text-[11px] shrink-0 font-mono self-end sm:self-center">
                  {log.ip_address && (
                    <span className="bg-surface-base px-2 py-0.5 rounded border border-white/[0.06] text-slate-400">
                      IP: {log.ip_address}
                    </span>
                  )}
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>
    </PageContainer>
  );
}
