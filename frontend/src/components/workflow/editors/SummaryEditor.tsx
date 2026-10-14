"use client";

import React, { useState } from "react";

interface SummaryEditorProps {
  initialSummary: string;
  onSave: (summary: string) => void;
  onCancel: () => void;
}

export function SummaryEditor({
  initialSummary,
  onSave,
  onCancel,
}: SummaryEditorProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const trimmed = summary.trim();
    if (!trimmed) {
      setError("Professional summary cannot be empty.");
      return;
    }
    setError(null);
    onSave(trimmed);
  };

  return (
    <div
      role="region"
      aria-label="Edit Professional Summary"
      className="p-4 rounded-xl border border-[#4F6BED]/40 bg-[#F8FAFC] shadow-sm space-y-3 animate-in fade-in duration-200"
    >
      <div className="flex items-center justify-between">
        <label
          htmlFor="summary-editor-textarea"
          className="text-xs font-bold text-[#4F6BED] uppercase tracking-wider"
        >
          Edit Professional Summary
        </label>
        <span className="text-[11px] text-[#64748B]">
          {summary.length} characters
        </span>
      </div>

      <textarea
        id="summary-editor-textarea"
        value={summary}
        onChange={(e) => {
          setSummary(e.target.value);
          if (error) setError(null);
        }}
        rows={4}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? "summary-editor-error" : undefined}
        className="w-full p-3 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs sm:text-sm focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none resize-y leading-relaxed"
        placeholder="Enter targeted professional summary..."
        autoFocus
      />

      {error && (
        <p
          id="summary-editor-error"
          role="alert"
          className="text-xs text-[#C24141] font-medium"
        >
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none"
        >
          Cancel editing
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#4F6BED] hover:bg-[#3D56D6] text-white shadow-sm transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
