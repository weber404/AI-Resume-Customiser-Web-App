"use client";

import React, { forwardRef } from "react";
import { MAX_JOB_DESCRIPTION_CHARS } from "@/lib/validation";

interface JobDescriptionInputProps {
  value: string;
  onChange: (val: string) => void;
  error: string | null;
  disabled?: boolean;
}

export const JobDescriptionInput = forwardRef<HTMLTextAreaElement, JobDescriptionInputProps>(
  function JobDescriptionInput({ value, onChange, error, disabled = false }, ref) {
    const charCount = value.length;
    const isNearLimit = charCount > MAX_JOB_DESCRIPTION_CHARS * 0.9;
    const isOverLimit = charCount > MAX_JOB_DESCRIPTION_CHARS;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="job-description-input" className="block text-sm font-semibold text-[#172033]">
            Target Job Description <span className="text-[#C24141]" aria-hidden="true">*</span>
          </label>
          <span
            aria-live="polite"
            className={`text-xs font-mono font-medium ${
              isOverLimit
                ? "text-[#C24141] font-semibold"
                : isNearLimit
                ? "text-amber-600"
                : "text-[#64748B]"
            }`}
          >
            {charCount.toLocaleString("en-US")} / {MAX_JOB_DESCRIPTION_CHARS.toLocaleString("en-US")} characters
          </span>
        </div>

        <div className="relative">
          <textarea
            ref={ref}
            id="job-description-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            rows={9}
            aria-invalid={!!error}
            aria-describedby={error ? "job-description-error" : undefined}
            placeholder="Paste the target job description here (responsibilities, required qualifications, technical stack, key skills)..."
            className={`w-full rounded-xl p-4 text-sm font-sans bg-white text-[#172033] placeholder-[#94A3B8] border transition-all resize-y outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              error
                ? "border-[#C24141]/60 focus:border-[#C24141] focus:ring-[#C24141]/20"
                : "border-[#CBD5E1] focus:border-[#4F6BED] focus:ring-[#4F6BED]/20"
            }`}
          />
        </div>

        {error && (
          <p
            id="job-description-error"
            role="alert"
            aria-live="polite"
            className="text-xs text-[#C24141] flex items-center gap-1.5 font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);
