"use client";

import React from "react";

interface ErrorAlertProps {
  error: {
    code?: string;
    message: string;
    details?: unknown;
  } | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ErrorAlert({ error, onDismiss, onRetry, isRetrying }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-[#991B1B] shadow-sm transition-all animate-in fade-in slide-in-from-top-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div
            className="w-8 h-8 rounded-lg bg-[#FEE2E2] border border-[#FECACA] flex items-center justify-center text-[#C24141] shrink-0 mt-0.5"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-[#991B1B]">Action Failed</span>
              {error.code && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
                  {error.code}
                </span>
              )}
            </div>

            <p className="text-xs text-[#7F1D1D] leading-relaxed font-sans">{error.message}</p>

            {/* Contextual guidance for common errors */}
            {error.code === "CONFIGURATION_ERROR" && (
              <div className="mt-2 p-2.5 rounded-lg bg-white border border-[#FDE68A] text-[11px] text-[#92400E] font-sans space-y-1">
                <p className="font-semibold text-[#B45309]">Server Configuration Needed:</p>
                <p>
                  To enable live AI tailoring, add your Google Gemini API key to{" "}
                  <code className="text-[#4F6BED] font-mono">backend/.env</code>:
                </p>
                <code className="block bg-[#F8FAFC] p-1.5 rounded font-mono text-[#1E293B] border border-[#E2E8F0] text-[10px]">
                  GEMINI_API_KEY=your_gemini_api_key_here
                </code>
              </div>
            )}

            {error.code === "SCANNED_PDF_DETECTED" && (
              <div className="mt-2 p-2.5 rounded-lg bg-white border border-[#FDE68A] text-[11px] text-[#92400E] font-sans">
                <p className="font-semibold text-[#B45309]">Text-Selectable PDF Required:</p>
                <p className="mt-0.5">
                  The uploaded PDF appears to be a scanned image. Please export your resume directly
                  from Word, Google Docs, or LaTeX to ensure selectable text.
                </p>
              </div>
            )}

            {(error.code === "LLM_PROVIDER_ERROR" || error.code === "LLM_TIMEOUT" || error.code === "REQUEST_TIMEOUT") && (
              <div className="mt-2 p-2.5 rounded-lg bg-white border border-[#BAE6FD] text-[11px] text-[#0369A1] font-sans">
                <p className="font-semibold text-[#0284C7]">Transient Service Notice:</p>
                <p className="mt-0.5">
                  Spikes in upstream AI demand or network timeouts are typically temporary. Your uploaded resume and job description have been preserved — click below to retry.
                </p>
              </div>
            )}

            {onRetry && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onRetry}
                  disabled={isRetrying}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#C24141] hover:bg-[#A83232] active:bg-[#8F2929] text-white shadow-sm transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C24141] focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRetrying ? (
                    <>
                      <svg className="animate-spin w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Retrying...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      Retry Tailoring
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-[#C24141] hover:text-[#991B1B] p-1 rounded-md hover:bg-[#FEE2E2] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C24141] focus-visible:outline-none"
            aria-label="Dismiss error alert"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
