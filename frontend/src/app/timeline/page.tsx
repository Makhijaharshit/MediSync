"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, TimelineItem } from "@/lib/api";
import {
  Clock,
  Filter,
  Search,
  CheckCircle2,
  FileText,
  Stethoscope,
  Pill,
  ShieldAlert,
  Activity,
  Calendar,
  Sparkles,
  FlaskConical,
  ClipboardList,
  Loader2,
  Trash2
} from "lucide-react";
import {
  PageContainer,
  SectionHeading,
  SurfaceCard,
  TimelineCard,
  PrimaryButton
} from "@/components/ui";

export default function TimelinePage() {
  const { user } = useAuth();
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyVerified, setOnlyVerified] = useState(true);
  const [deletingItem, setDeletingItem] = useState<TimelineItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadTimeline();
  }, [user, activeCategory, onlyVerified]);

  async function loadTimeline() {
    try {
      setLoading(true);
      const cat = activeCategory === "all" ? undefined : activeCategory;
      const data = await api.timeline.get(cat, undefined, onlyVerified);
      setTimeline(data || []);
    } catch (err) {
      console.error("Timeline error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingItem) return;
    try {
      setDeleteLoading(true);
      setErrorMsg("");
      await api.timeline.delete(deletingItem.id);
      setTimeline((prev) => prev.filter((item) => item.id !== deletingItem.id));
      setDeletingItem(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete medical record.");
    } finally {
      setDeleteLoading(false);
    }
  }

  const filteredTimeline = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return timeline;
    return timeline.filter((item) => {
      return (
        item.value?.toLowerCase().includes(q) ||
        item.details?.toLowerCase().includes(q) ||
        item.source_document_title?.toLowerCase().includes(q) ||
        item.type?.toLowerCase().includes(q)
      );
    });
  }, [timeline, searchQuery]);

  // Group events by recorded year
  const groupedByYear = useMemo(() => {
    const groups: { [year: string]: TimelineItem[] } = {};
    filteredTimeline.forEach((item) => {
      let year = "2026";
      if (item.date_recorded && item.date_recorded.length >= 4) {
        year = item.date_recorded.slice(0, 4);
      } else if (item.created_at) {
        year = new Date(item.created_at).getFullYear().toString();
      }
      if (!groups[year]) groups[year] = [];
      groups[year].push(item);
    });

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((year) => ({
        year,
        items: groups[year],
      }));
  }, [filteredTimeline]);

  const categories = [
    { key: "all", label: "All Events", icon: Clock },
    { key: "diagnosis", label: "Diagnoses", icon: Activity },
    { key: "medication", label: "Medications", icon: Pill },
    { key: "allergy", label: "Allergies", icon: ShieldAlert },
    { key: "procedure", label: "Procedures", icon: Stethoscope },
    { key: "lab_result", label: "Lab Results", icon: FlaskConical },
    { key: "doctor_note", label: "Doctor Notes", icon: ClipboardList },
  ];

  return (
    <PageContainer>
      {/* Page Header */}
      <SectionHeading
        title="Longitudinal Medical Timeline"
        subtitle="Chronological, unified medical trajectory aggregated from verified hospital discharge summaries, clinical encounters, and prescriptions."
        backHref="/dashboard"
        backLabel="Dashboard"
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {timeline.length} Indexed Events
          </span>
        }
        actions={
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-slate-300 cursor-pointer shadow-sm">
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={(e) => setOnlyVerified(e.target.checked)}
              className="rounded border-white/20 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 bg-black/40"
            />
            <span>Show Only Verified</span>
          </label>
        }
      />

      {/* Filter Tabs & Search Bar */}
      <SurfaceCard className="!p-4 space-y-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = activeCategory === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setActiveCategory(c.key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search longitudinal history by diagnosis, prescription, or clinical details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </SurfaceCard>

      {/* Timeline Stream */}
      {loading ? (
        <div className="p-20 text-center text-slate-500 space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          <p className="text-xs font-medium">Aggregating longitudinal clinical timeline...</p>
        </div>
      ) : groupedByYear.length === 0 ? (
        <SurfaceCard className="p-16 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-base font-semibold text-white">No timeline records found</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? "No timeline records match your search criteria."
              : "Verify uploaded medical documents to populate your longitudinal medical trajectory."}
          </p>
          <div className="pt-2">
            <PrimaryButton href="/documents">
              Go to Documents
            </PrimaryButton>
          </div>
        </SurfaceCard>
      ) : (
        <div className="space-y-10">
          {groupedByYear.map((group) => (
            <div key={group.year} className="space-y-4">
              {/* Sticky Year Label */}
              <div className="sticky top-20 z-20 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#080C14]/90 border border-white/[0.08] text-xs font-bold tracking-wider text-blue-400 backdrop-blur-xl shadow-lg font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>YEAR {group.year}</span>
                <span className="text-slate-500 font-normal">({group.items.length} records)</span>
              </div>

              {/* Event Cards inside this year */}
              <div className="pt-2">
                {group.items.map((item, idx) => (
                  <TimelineCard
                    key={item.id}
                    item={item}
                    isLast={idx === group.items.length - 1}
                    onDelete={(it) => setDeletingItem(it)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Record Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#0B0F19] border border-white/[0.12] shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Delete Medical Record?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to delete the {deletingItem.type.replace("_", " ")} record: <span className="text-white font-medium">"{deletingItem.value}"</span>? This will permanently remove it from your clinical health trajectory.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 shadow-sm shadow-red-500/20 transition-all flex items-center gap-1.5"
              >
                {deleteLoading ? (
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
