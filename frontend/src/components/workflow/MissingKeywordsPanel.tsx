"use client";

import React from "react";
import { MissingKeywordSuggestion } from "@/types";

interface MissingKeywordsPanelProps {
  missingKeywords: MissingKeywordSuggestion[];
}

export function MissingKeywordsPanel({ missingKeywords }: MissingKeywordsPanelProps) {
  if (!missingKeywords || missingKeywords.length === 0) {
    return (
      <section
        aria-label="Keyword coverage summary"
        className="rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] p-5 text-[#065F46] shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-[#16845B] shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="text-sm font-semibold text-[#065F46]">Full Keyword Coverage</h3>
        </div>
        <p className="text-xs text-[#047857] mt-1 pl-7 font-sans leading-relaxed">
          No critical unverified keywords were identified. Your resume already covers the core requirements detected in the job posting.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="missing-keywords-title"
      className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-6 space-y-4 shadow-sm"
    >
      {/* Header and Candidate Advisory */}
      <div className="space-y-2 border-b border-[#FDE68A] pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
            <h3 id="missing-keywords-title" className="text-base font-bold text-[#92400E]">
              Suggested Missing Keywords ({missingKeywords.length})
            </h3>
          </div>
          <span className="text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309] px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
            Candidate Verification Required
          </span>
        </div>

        <div
          role="note"
          aria-label="Important truthfulness rule"
          className="p-3.5 rounded-xl bg-white border border-[#FDE68A] text-[#92400E] text-xs leading-relaxed space-y-1 font-sans shadow-xs"
        >
          <p className="font-semibold text-[#B45309] flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-amber-500 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Important Truthfulness Rule:
          </p>
          <p className="text-[#92400E]/90 pl-5.5">
            These keywords were detected in the target job description but <strong>not evidenced</strong> in your original resume.
            To maintain 100% honesty, <strong>they have NOT been added to your tailored resume</strong>.
            Review each item below and incorporate it only if you genuinely have verifiable, real-world experience with it.
          </p>
        </div>
      </div>

      {/* Grid of Missing Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {missingKeywords.map((item, idx) => (
          <div
            key={`${item.keyword}-${idx}`}
            className="rounded-xl bg-white border border-[#FDE68A] p-4 space-y-2 hover:border-amber-400 transition-colors shadow-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-[#172033] tracking-wide">
                {item.keyword}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#FDE68A]">
                {item.category}
              </span>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              {item.context_or_reason}
            </p>

            <div className="pt-1 border-t border-[#F1F5F9] text-[11px] text-[#475569] flex items-start gap-1.5 font-medium">
              <span className="text-amber-600 font-bold shrink-0">&rarr;</span>
              <span>{item.suggested_action}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
