"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { FileUploadZone, FileUploadZoneHandle } from "@/components/workflow/FileUploadZone";
import { JobDescriptionInput } from "@/components/workflow/JobDescriptionInput";
import { ErrorAlert } from "@/components/workflow/ErrorAlert";
import { TailoredResumeView } from "@/components/workflow/TailoredResumeView";
import { extractResume, tailorResume, ApiError } from "@/lib/api";
import { validateResumeFile, validateJobDescription } from "@/lib/validation";
import { TailoredResumeResponse } from "@/types";

export default function TailorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<{
    code?: string;
    message: string;
    details?: unknown;
  } | null>(null);
  const [loadingStep, setLoadingStep] = useState<"idle" | "extracting" | "tailoring">("idle");
  const [tailoredResult, setTailoredResult] = useState<TailoredResumeResponse | null>(null);
  const [showInputs, setShowInputs] = useState<boolean>(true);

  // References for keyboard focus management on validation failure
  const fileZoneRef = useRef<FileUploadZoneHandle | null>(null);
  const jobInputRef = useRef<HTMLTextAreaElement | null>(null);

  // In-flight request controller and extraction cache for instantaneous retry
  const abortControllerRef = useRef<AbortController | null>(null);
  const extractedCacheRef = useRef<{ fileKey: string; text: string } | null>(null);

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setFileError(null);
    setApiError(null);
    extractedCacheRef.current = null;
    if (selectedFile) {
      const validation = validateResumeFile(selectedFile);
      if (!validation.isValid) {
        setFileError(validation.error);
      }
    }
  };

  const handleJobChange = (val: string) => {
    setJobDescription(val);
    setJobError(null);
    setApiError(null);
  };

  const handleReset = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    extractedCacheRef.current = null;
    setFile(null);
    setJobDescription("");
    setFileError(null);
    setJobError(null);
    setApiError(null);
    setLoadingStep("idle");
    setTailoredResult(null);
    setShowInputs(true);
  };

  const executeWorkflow = async () => {
    if (loadingStep !== "idle") return;

    setFileError(null);
    setJobError(null);
    setApiError(null);

    const fileValidation = validateResumeFile(file);
    if (!fileValidation.isValid) {
      setFileError(fileValidation.error);
      fileZoneRef.current?.focus();
      return;
    }

    const jobValidation = validateJobDescription(jobDescription);
    if (!jobValidation.isValid) {
      setJobError(jobValidation.error);
      jobInputRef.current?.focus();
      return;
    }

    // Cancel any previous in-flight request before launching new attempt
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const currentFileKey = `${file!.name}-${file!.size}-${file!.lastModified}`;
      let extractedText = "";

      // Step 1: Use cached extraction if identical file was already extracted, otherwise extract
      if (extractedCacheRef.current && extractedCacheRef.current.fileKey === currentFileKey) {
        extractedText = extractedCacheRef.current.text;
      } else {
        setLoadingStep("extracting");
        const extraction = await extractResume(file!, controller.signal);
        extractedText = extraction.extracted_text;
        extractedCacheRef.current = { fileKey: currentFileKey, text: extractedText };
      }

      // Step 2: Tailor resume against job description using Gemini AI
      setLoadingStep("tailoring");
      const tailored = await tailorResume(
        {
          extracted_text: extractedText,
          job_description: jobDescription.trim(),
        },
        controller.signal
      );

      // Step 3: Present validated results
      setTailoredResult(tailored);
      setShowInputs(false);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code !== "REQUEST_CANCELLED") {
          setApiError({
            code: err.code,
            message: err.message,
            details: err.details,
          });
        }
      } else {
        setApiError({
          code: "UNEXPECTED_ERROR",
          message: err instanceof Error ? err.message : "An unexpected failure occurred during processing.",
        });
      }
    } finally {
      setLoadingStep("idle");
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeWorkflow();
  };

  const handleRetry = async () => {
    await executeWorkflow();
  };

  return (
    <>
      {/* Skip to Main Content Link for Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-[#4F6BED] text-white rounded-lg shadow-xl font-medium transition-all focus-visible:outline-none"
      >
        Skip to main content
      </a>

      {/* Screen Reader Progress Announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {loadingStep === "extracting" && "Step 1 of 2: Ingesting and extracting resume text from uploaded document."}
        {loadingStep === "tailoring" && "Step 2 of 2: Analyzing requirements and tailoring resume with Gemini AI."}
      </div>

      <div className="min-h-screen bg-[#F7F9FC] text-[#172033] flex flex-col justify-between">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-[#E2E8F0]">
          <div className="site-container px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2.5 text-[#172033] hover:opacity-90 transition-opacity focus-visible:rounded"
                aria-label="AI Resume Tailor Home"
              >
                <div
                  className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4F6BED] to-[#6E85F7] flex items-center justify-center shadow-sm text-white font-semibold text-sm"
                  aria-hidden="true"
                >
                  RT
                </div>
                <div>
                  <span className="font-semibold text-base tracking-tight text-[#172033]">
                    AI Resume Tailor
                  </span>
                  <span className="hidden sm:inline-block ml-2 text-xs font-normal text-[#64748B]">
                    / Workspace
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-xs font-medium text-[#64748B] hover:text-[#172033] px-3 py-1.5 rounded-lg hover:bg-[#EEF4FF] transition-colors"
              >
                &larr; Back to Overview
              </Link>

              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#EEF4FF] text-[#4F6BED] border border-[#E2E8F0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16845B]" aria-hidden="true" />
                Service Ready
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main id="main-content" className="site-container w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 flex-1 focus:outline-none">

          {/* Workflow Header / Title */}
          {showInputs && (
            <div className="text-center space-y-2.5 max-w-2xl mx-auto pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EEF4FF] text-[#4F6BED]">
                Workspace
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#172033]">
                Tailor Your Resume
              </h1>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                Upload your resume and paste the target job description. The AI realigns your documented experience to mirror job requirements without inventing unverified facts.
              </p>
            </div>
          )}

          {/* Active Error Banner */}
          <ErrorAlert
            error={apiError}
            onDismiss={() => setApiError(null)}
            onRetry={handleRetry}
            isRetrying={loadingStep !== "idle"}
          />

          {/* Interactive Workspace Area */}
          {showInputs ? (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: File Upload */}
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-7 space-y-4 shadow-sm">
                  <FileUploadZone
                    ref={fileZoneRef}
                    file={file}
                    onFileSelect={handleFileSelect}
                    error={fileError}
                    disabled={loadingStep !== "idle"}
                  />

                  <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E2E8F0] text-xs text-[#64748B] space-y-1">
                    <p className="font-semibold text-[#172033]">Privacy & Ingestion Guarantee:</p>
                    <p>
                      Files are processed strictly in-memory and never stored on persistent disks. Standard text-selectable PDFs and DOCX files up to 5 MB are supported.
                    </p>
                  </div>
                </div>

                {/* Right Column: Target Job Description */}
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-7 space-y-4 shadow-sm">
                  <JobDescriptionInput
                    ref={jobInputRef}
                    value={jobDescription}
                    onChange={handleJobChange}
                    error={jobError}
                    disabled={loadingStep !== "idle"}
                  />

                  <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E2E8F0] text-xs text-[#64748B] space-y-1">
                    <p className="font-semibold text-[#172033]">Target Role Alignment:</p>
                    <p>
                      Include responsibilities and key requirements. The AI realigns your existing bullet points to showcase relevance without modifying career facts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-xs text-[#64748B]">
                  {tailoredResult && (
                    <button
                      type="button"
                      onClick={() => setShowInputs(false)}
                      className="text-[#4F6BED] hover:underline font-medium cursor-pointer focus-visible:ring-2 focus-visible:ring-[#4F6BED] rounded"
                    >
                      &larr; Return to tailored resume result
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {(file || jobDescription) && (
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={loadingStep !== "idle"}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] border border-[#E2E8F0] transition-colors disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#4F6BED]"
                    >
                      Reset
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={loadingStep !== "idle"}
                    className="w-full sm:w-auto min-w-[210px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#4F6BED] hover:bg-[#3D56D6] active:bg-[#3047C4] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#4F6BED]"
                  >
                    {loadingStep === "extracting" && (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                        <span>Step 1/2: Extracting resume...</span>
                      </>
                    )}

                    {loadingStep === "tailoring" && (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                        <span>Step 2/2: Tailoring with AI...</span>
                      </>
                    )}

                    {loadingStep === "idle" && (
                      <>
                        <span>Tailor My Resume</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            tailoredResult && (
              <TailoredResumeView
                response={tailoredResult}
                onEditInputs={() => setShowInputs(true)}
                onReset={handleReset}
                onUpdateResume={(updated) => setTailoredResult(updated)}
              />
            )
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-[#E2E8F0] bg-white py-6">
          <div className="site-container px-4 sm:px-6 lg:px-8 text-center space-y-1.5 text-xs text-[#64748B]">
            <p className="font-medium text-[#172033]">
              AI Resume Tailor &bull; Ephemeral In-Memory Document Processing
            </p>
            <p className="text-[11px] text-[#94A3B8]">
              Your resume files are processed strictly in RAM and never retained in storage.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
