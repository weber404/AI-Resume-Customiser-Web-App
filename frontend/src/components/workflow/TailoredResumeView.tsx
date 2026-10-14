"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  TailoredResumeResponse,
  ResumeData,
  ContactInfo,
  SkillCategory,
  ExperienceItem,
  ProjectItem,
  EducationItem,
  CertificationItem,
} from "@/types";
import { MissingKeywordsPanel } from "@/components/workflow/MissingKeywordsPanel";
import {
  ContactEditor,
  SummaryEditor,
  SkillsEditor,
  ExperienceEditor,
  ProjectsEditor,
  EducationEditor,
  CertificationsEditor,
} from "@/components/workflow/editors";
import {
  exportResumePdf,
  exportResumeDocx,
  triggerBrowserDownload,
} from "@/lib/api";

interface TailoredResumeViewProps {
  response: TailoredResumeResponse;
  onEditInputs: () => void;
  onReset: () => void;
  onUpdateResume?: (updated: TailoredResumeResponse) => void;
}

type EditingSection =
  | "contact"
  | "summary"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "certifications";

function PencilIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  );
}

export function TailoredResumeView({
  response,
  onEditInputs,
  onReset,
  onUpdateResume,
}: TailoredResumeViewProps) {
  // Working resume represents the single source of truth for display & exports
  const [workingResume, setWorkingResume] = useState<ResumeData>(
    response.tailored_resume
  );
  const [activeEditingSection, setActiveEditingSection] =
    useState<EditingSection | null>(null);
  const [hasManualEdits, setHasManualEdits] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string>(
    "Resume tailoring completed successfully. Your tailored ATS resume is ready to review and download."
  );

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const resultsContainerRef = useRef<HTMLDivElement | null>(null);

  const [prevResponse, setPrevResponse] = useState(response);
  if (response !== prevResponse) {
    setPrevResponse(response);
    setWorkingResume(response.tailored_resume);
  }

  // Focus management: automatically move focus to results landmark on mount
  useEffect(() => {
    resultsContainerRef.current?.focus();
  }, []);

  const handleStartEdit = (section: EditingSection) => {
    if (activeEditingSection && activeEditingSection !== section) {
      if (typeof window !== "undefined") {
        const confirmSwitch = window.confirm(
          "You have an active editing section. Discard unsaved changes and switch sections?"
        );
        if (!confirmSwitch) return;
      }
    }
    setActiveEditingSection(section);
  };

  const handleCancelEdit = () => {
    setActiveEditingSection(null);
  };

  const notifyParent = (updatedResume: ResumeData) => {
    setWorkingResume(updatedResume);
    setHasManualEdits(true);
    setActiveEditingSection(null);
    if (onUpdateResume) {
      onUpdateResume({
        ...response,
        tailored_resume: updatedResume,
      });
    }
  };

  const handleSaveContact = (updatedContact: ContactInfo) => {
    const updated = { ...workingResume, contact: updatedContact };
    notifyParent(updated);
    setLiveStatus("Contact information updated successfully.");
  };

  const handleSaveSummary = (updatedSummary: string) => {
    const updated = { ...workingResume, professional_summary: updatedSummary };
    notifyParent(updated);
    setLiveStatus("Professional summary updated successfully.");
  };

  const handleSaveSkills = (updatedSkills: SkillCategory[]) => {
    const updated = { ...workingResume, skills: updatedSkills };
    notifyParent(updated);
    setLiveStatus("Technical skills updated successfully.");
  };

  const handleSaveExperience = (updatedExperience: ExperienceItem[]) => {
    const updated = { ...workingResume, experience: updatedExperience };
    notifyParent(updated);
    setLiveStatus("Work experience updated successfully.");
  };

  const handleSaveProjects = (updatedProjects: ProjectItem[]) => {
    const updated = { ...workingResume, projects: updatedProjects };
    notifyParent(updated);
    setLiveStatus("Projects updated successfully.");
  };

  const handleSaveEducation = (updatedEducation: EducationItem[]) => {
    const updated = { ...workingResume, education: updatedEducation };
    notifyParent(updated);
    setLiveStatus("Education updated successfully.");
  };

  const handleSaveCertifications = (updatedCertifications: CertificationItem[]) => {
    const updated = { ...workingResume, certifications: updatedCertifications };
    notifyParent(updated);
    setLiveStatus("Certifications updated successfully.");
  };

  const handleDownloadPdf = async () => {
    if (isExportingPdf || isExportingDocx) return;
    setIsExportingPdf(true);
    setExportError(null);

    try {
      const currentPayload: TailoredResumeResponse = {
        ...response,
        tailored_resume: workingResume,
      };
      const { blob, filename } = await exportResumePdf(currentPayload);
      triggerBrowserDownload(blob, filename);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to export PDF";
      setExportError(msg);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (isExportingPdf || isExportingDocx) return;
    setIsExportingDocx(true);
    setExportError(null);

    try {
      const currentPayload: TailoredResumeResponse = {
        ...response,
        tailored_resume: workingResume,
      };
      const { blob, filename } = await exportResumeDocx(currentPayload);
      triggerBrowserDownload(blob, filename);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to export Word DOCX";
      setExportError(msg);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const { contact, professional_summary, skills, experience, projects, education, certifications } =
    workingResume;
  const { missing_keywords, alignment_score, summary_notes } = response;

  return (
    <section
      ref={resultsContainerRef}
      tabIndex={-1}
      aria-label="Tailored resume results"
      className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none"
    >
      {/* Screen Reader Announcement for Workflow Completion & Edit Events */}
      <div className="sr-only" role="status" aria-live="polite">
        {liveStatus}
      </div>

      {/* Top Action & Overview Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#16845B] border border-[#A7F3D0]">
              <span className="w-2 h-2 rounded-full bg-[#16845B]" aria-hidden="true" />
              Tailoring Complete
            </span>

            {hasManualEdits && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                <PencilIcon className="w-3 h-3" />
                Edited Manually
              </span>
            )}

            {alignment_score !== null && alignment_score !== undefined && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF4FF] text-[#4F6BED] border border-[#E2E8F0]">
                <span>Coverage Match:</span>
                <span className="font-bold text-[#172033]">{alignment_score}%</span>
                {hasManualEdits && (
                  <span className="text-[10px] text-[#B45309] font-normal ml-1">
                    (Initial AI Score)
                  </span>
                )}
              </div>
            )}
          </div>

          {alignment_score !== null && alignment_score !== undefined && (
            <p className="text-[11px] text-[#64748B] pt-0.5 font-sans">
              {hasManualEdits
                ? "* Match score was calculated from initial AI tailoring and is not recalculated for subsequent manual edits."
                : "* Informational keyword & requirement coverage estimate, not a hiring guarantee."}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download PDF Action */}
          <button
            type="button"
            id="download-pdf-button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf || isExportingDocx}
            aria-label="Download tailored resume as ATS-compliant PDF document"
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none ${isExportingPdf
                ? "bg-[#3D56D6] text-white cursor-wait"
                : "bg-[#4F6BED] hover:bg-[#3D56D6] text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isExportingPdf ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Exporting PDF...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download PDF
              </>
            )}
          </button>

          {/* Download DOCX Action */}
          <button
            type="button"
            id="download-docx-button"
            onClick={handleDownloadDocx}
            disabled={isExportingPdf || isExportingDocx}
            aria-label="Download tailored resume as ATS-compliant Word DOCX document"
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none ${isExportingDocx
                ? "bg-[#F1F5F9] text-[#64748B] cursor-wait"
                : "bg-white hover:bg-[#F8FAFC] text-[#172033] border border-[#CBD5E1]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isExportingDocx ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5 text-[#4F6BED]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Exporting DOCX...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download DOCX
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onEditInputs}
            aria-label="Edit resume file or job description inputs"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#172033] border border-[#E2E8F0] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Inputs
          </button>

          <button
            type="button"
            onClick={onReset}
            aria-label="Reset all inputs and start over"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#FEF2F2] text-[#C24141] border border-[#FECACA] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C24141] focus-visible:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Start Over
          </button>
        </div>
      </div>

      {/* Export Error Alert (with Retry) */}
      {exportError && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-center justify-between p-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] text-[#991B1B] text-xs shadow-sm animate-in fade-in"
        >
          <div className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#C24141] shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-[#991B1B]">Export Generation Failed</p>
              <p className="text-[#7F1D1D]">{exportError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExportError(null)}
            className="px-2.5 py-1 rounded-lg bg-white border border-[#FECACA] hover:bg-[#FEE2E2] text-[#991B1B] text-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C24141] focus-visible:outline-none"
            aria-label="Dismiss export error"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary Notes from AI (if provided) */}
      {summary_notes && (
        <div
          role="note"
          aria-label="Tailoring strategy highlights"
          className="p-4 rounded-xl border border-[#BAE6FD] bg-[#EEF4FF] text-[#0369A1] text-xs leading-relaxed space-y-1 font-sans"
        >
          <p className="font-semibold text-[#0284C7] flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#0284C7]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Tailoring Highlights:
          </p>
          <p className="text-[#0369A1] pl-5.5">{summary_notes}</p>
        </div>
      )}

      {/* Structured Resume Content (Apple-Style Pristine Document Sheet) */}
      <article className="rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-12 paper-shadow space-y-8 font-sans">
        {/* Contact Info Header */}
        {contact && (
          <header className={`border-b border-[#E2E8F0] pb-6 text-center space-y-2 transition-all ${activeEditingSection === "contact"
              ? "p-4 rounded-xl border border-[#4F6BED]/60 bg-[#F8FAFC] ring-2 ring-[#4F6BED]/20"
              : ""
            }`}>
            {activeEditingSection === "contact" ? (
              <ContactEditor
                initialContact={contact}
                onSave={handleSaveContact}
                onCancel={handleCancelEdit}
              />
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 relative">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
                    {contact.full_name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleStartEdit("contact")}
                    aria-label="Edit Contact Information"
                    className="inline-flex items-center gap-1 text-[#94A3B8] hover:text-[#4F6BED] text-xs px-2 py-1 rounded-md hover:bg-[#EEF4FF] transition-colors focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none cursor-pointer"
                  >
                    <PencilIcon className="w-3.5 h-3.5" />
                    <span className="sr-only sm:not-sr-only text-[11px] font-medium">Edit</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[#475569]">
                  {contact.location && <span>{contact.location}</span>}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="hover:text-[#4F6BED] transition-colors underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none rounded"
                    >
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && <span>{contact.phone}</span>}
                  {contact.linkedin_url && (
                    <a
                      href={contact.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#4F6BED] transition-colors underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none rounded"
                    >
                      LinkedIn
                    </a>
                  )}
                  {contact.github_url && (
                    <a
                      href={contact.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#4F6BED] transition-colors underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none rounded"
                    >
                      GitHub
                    </a>
                  )}
                  {contact.portfolio_url && (
                    <a
                      href={contact.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#4F6BED] transition-colors underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none rounded"
                    >
                      Portfolio
                    </a>
                  )}
                </div>
              </>
            )}
          </header>
        )}

        {/* Professional Summary */}
        {professional_summary !== undefined && professional_summary !== null && (
          <section
            className={`space-y-2 transition-all ${activeEditingSection === "summary"
                ? "p-4 rounded-xl border border-[#4F6BED]/60 bg-[#F8FAFC] ring-2 ring-[#4F6BED]/20"
                : ""
              }`}
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1.5">
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#4F6BED]">
                Professional Summary
              </h3>
              {activeEditingSection !== "summary" && (
                <button
                  type="button"
                  onClick={() => handleStartEdit("summary")}
                  aria-label="Edit Professional Summary"
                  className="inline-flex items-center gap-1 text-[#94A3B8] hover:text-[#4F6BED] text-xs px-2 py-1 rounded-md hover:bg-[#EEF4FF] transition-colors focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none cursor-pointer"
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                  <span className="sr-only sm:not-sr-only text-[11px] font-medium">Edit</span>
                </button>
              )}
            </div>

            {activeEditingSection === "summary" ? (
              <SummaryEditor
                initialSummary={professional_summary}
                onSave={handleSaveSummary}
                onCancel={handleCancelEdit}
              />
            ) : (
              <p className="text-xs sm:text-[13px] text-[#334155] leading-relaxed pt-1">
                {professional_summary}
              </p>
            )}
          </section>
        )}

        {/* Skills Matrix */}
        {skills && skills.length > 0 && (
          <section
            className={`space-y-3 transition-all ${activeEditingSection === "skills"
                ? "p-4 rounded-xl border border-[#4F6BED]/60 bg-[#F8FAFC] ring-2 ring-[#4F6BED]/20"
                : ""
              }`}
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1.5">
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#4F6BED]">
                Technical & Professional Skills
              </h3>
              {activeEditingSection !== "skills" && (
                <button
                  type="button"
                  onClick={() => handleStartEdit("skills")}
                  aria-label="Edit Technical Skills"
                  className="inline-flex items-center gap-1 text-[#94A3B8] hover:text-[#4F6BED] text-xs px-2 py-1 rounded-md hover:bg-[#EEF4FF] transition-colors focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none cursor-pointer"
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                  <span className="sr-only sm:not-sr-only text-[11px] font-medium">Edit</span>
                </button>
              )}
            </div>

            {activeEditingSection === "skills" ? (
              <SkillsEditor
                initialSkills={skills}
                onSave={handleSaveSkills}
                onCancel={handleCancelEdit}
              />
            ) : (
              <div className="space-y-2 pt-1">
                {skills.map((category) => (
                  <div key={category.category} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                    <span className="text-xs font-bold text-[#0F172A] shrink-0">
                      {category.category}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {category.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Work Experience */}
        {experience && experience.length > 0 && (
          <section
            className={`space-y-5 transition-all ${activeEditingSection === "experience"
                ? "p-4 rounded-xl border border-[#4F6BED]/60 bg-[#F8FAFC] ring-2 ring-[#4F6BED]/20"
                : ""
              }`}
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1.5">
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#4F6BED]">
                Work Experience
              </h3>
              {activeEditingSection !== "experience" && (
                <button
                  type="button"
                  onClick={() => handleStartEdit("experience")}
                  aria-label="Edit Work Experience"
                  className="inline-flex items-center gap-1 text-[#94A3B8] hover:text-[#4F6BED] text-xs px-2 py-1 rounded-md hover:bg-[#EEF4FF] transition-colors focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none cursor-pointer"
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                  <span className="sr-only sm:not-sr-only text-[11px] font-medium">Edit</span>
                </button>
              )}
            </div>

            {activeEditingSection === "experience" ? (
              <ExperienceEditor
                initialExperience={experience}
                onSave={handleSaveExperience}
                onCancel={handleCancelEdit}
              />
            ) : (
              <div className="space-y-6 pt-1">
                {experience.map((exp, idx) => (
                  <div key={`${exp.company}-${exp.title}-${idx}`} className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="text-sm font-bold text-[#0F172A]">
                          {exp.title}
                          <span className="text-[#64748B] font-normal"> &mdash; {exp.company}</span>
                        </h4>
                        {exp.location && (
                          <p className="text-xs text-[#64748B]">{exp.location}</p>
                        )}
                      </div>
                      <div className="text-xs text-[#64748B] font-mono shrink-0">
                        {exp.start_date} – {exp.is_current ? "Present" : exp.end_date || "Present"}
                      </div>
                    </div>

                    {/* Bullet points */}
                    {exp.bullet_points && exp.bullet_points.length > 0 && (
                      <ul className="list-disc list-outside pl-4 space-y-1.5 text-xs sm:text-[13px] text-[#334155] leading-relaxed">
                        {exp.bullet_points.map((point, bIdx) => (
                          <li key={bIdx}>{point}</li>
                        ))}
                      </ul>
                    )}

                    {/* Technologies */}
                    {exp.technologies_used && exp.technologies_used.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-[#64748B]">
                        <span className="font-medium text-[#475569]">Technologies:</span>
                        {exp.technologies_used.map((tech) => (
                          <span key={tech} className="px-1.5 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569]">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Key Projects */}
        {projects && projects.length > 0 && (
          <section
            className={`space-y-4 transition-all ${activeEditingSection === "projects"
                ? "p-4 rounded-xl border border-[#4F6BED]/60 bg-[#F8FAFC] ring-2 ring-[#4F6BED]/20"
                : ""
              }`}
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1.5">
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#4F6BED]">
                Key Projects
              </h3>
              {activeEditingSection !== "projects" && (
                <button
                  type="button"
                  onClick={() => handleStartEdit("projects")}
                  aria-label="Edit Projects"
                  className="inline-flex items-center gap-1 text-[#94A3B8] hover:text-[#4F6BED] text-xs px-2 py-1 rounded-md hover:bg-[#EEF4FF] transition-colors focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none cursor-pointer"
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                  <span className="sr-only sm:not-sr-only text-[11px] font-medium">Edit</span>
                </button>
              )}
            </div>

            {activeEditingSection === "projects" ? (
              <ProjectsEditor
                initialProjects={projects}
                onSave={handleSaveProjects}
                onCancel={handleCancelEdit}
              />
            ) : (
              <div className="space-y-4 pt-1">
                {projects.map((proj, idx) => (
                  <div
                    key={`${proj.title}-${idx}`}
                    className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-[#0F172A]">{proj.title}</h4>
                      {proj.url && (
                        <a
                          href={proj.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#4F6BED] hover:underline break-all focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none rounded font-medium"
                        >
                          Demo / Repo &rarr;
                        </a>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-xs text-[#475569] leading-normal">{proj.description}</p>
                    )}
                    {proj.bullet_points && proj.bullet_points.length > 0 && (
                      <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-[#334155]">
                        {proj.bullet_points.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    )}
                    {proj.technologies_used && proj.technologies_used.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-[#64748B]">
                        <span className="font-medium text-[#475569]">Stack:</span>
                        {proj.technologies_used.map((tech) => (
                          <span key={tech} className="px-1.5 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#475569]">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <section
            className={`space-y-3 transition-all ${activeEditingSection === "education"
                ? "p-4 rounded-xl border border-[#4F6BED]/60 bg-[#F8FAFC] ring-2 ring-[#4F6BED]/20"
                : ""
              }`}
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1.5">
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#4F6BED]">
                Education
              </h3>
              {activeEditingSection !== "education" && (
                <button
                  type="button"
                  onClick={() => handleStartEdit("education")}
                  aria-label="Edit Education"
                  className="inline-flex items-center gap-1 text-[#94A3B8] hover:text-[#4F6BED] text-xs px-2 py-1 rounded-md hover:bg-[#EEF4FF] transition-colors focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none cursor-pointer"
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                  <span className="sr-only sm:not-sr-only text-[11px] font-medium">Edit</span>
                </button>
              )}
            </div>

            {activeEditingSection === "education" ? (
              <EducationEditor
                initialEducation={education}
                onSave={handleSaveEducation}
                onCancel={handleCancelEdit}
              />
            ) : (
              <div className="space-y-3 pt-1">
                {education.map((edu, idx) => (
                  <div key={`${edu.institution}-${edu.degree}-${idx}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className="text-xs font-bold text-[#0F172A]">
                        {edu.degree}
                        {edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                      </h4>
                      <p className="text-xs text-[#64748B]">{edu.institution}</p>
                    </div>
                    <div className="text-xs text-[#64748B] font-mono">
                      {edu.start_date ? `${edu.start_date} – ` : ""}
                      {edu.end_date || ""}
                      {edu.gpa ? ` (GPA: ${edu.gpa})` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <section
            className={`space-y-3 transition-all ${activeEditingSection === "certifications"
                ? "p-4 rounded-xl border border-[#4F6BED]/60 bg-[#F8FAFC] ring-2 ring-[#4F6BED]/20"
                : ""
              }`}
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1.5">
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#4F6BED]">
                Certifications
              </h3>
              {activeEditingSection !== "certifications" && (
                <button
                  type="button"
                  onClick={() => handleStartEdit("certifications")}
                  aria-label="Edit Certifications"
                  className="inline-flex items-center gap-1 text-[#94A3B8] hover:text-[#4F6BED] text-xs px-2 py-1 rounded-md hover:bg-[#EEF4FF] transition-colors focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none cursor-pointer"
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                  <span className="sr-only sm:not-sr-only text-[11px] font-medium">Edit</span>
                </button>
              )}
            </div>

            {activeEditingSection === "certifications" ? (
              <CertificationsEditor
                initialCertifications={certifications}
                onSave={handleSaveCertifications}
                onCancel={handleCancelEdit}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {certifications.map((cert, idx) => (
                  <div key={`${cert.name}-${idx}`} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                    <span className="block font-semibold text-[#0F172A]">{cert.name}</span>
                    <span className="block text-[#64748B] text-[11px] mt-0.5">
                      {cert.issuer} {cert.issue_date ? `• ${cert.issue_date}` : ""}
                    </span>
                    {cert.credential_id && (
                      <span className="block text-[#94A3B8] font-mono text-[10px] mt-0.5">
                        ID: {cert.credential_id}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Bottom Download Bar */}
        <div className="pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#64748B] font-sans text-center sm:text-left">
            Export ATS-compliant document without watermarks:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf || isExportingDocx}
              aria-label="Download tailored resume as ATS-compliant PDF document"
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none ${isExportingPdf
                  ? "bg-[#3D56D6] text-white cursor-wait"
                  : "bg-[#4F6BED] hover:bg-[#3D56D6] text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isExportingPdf ? "Exporting PDF..." : "Download PDF"}
            </button>
            <button
              type="button"
              onClick={handleDownloadDocx}
              disabled={isExportingPdf || isExportingDocx}
              aria-label="Download tailored resume as ATS-compliant Word DOCX document"
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none ${isExportingDocx
                  ? "bg-[#F1F5F9] text-[#64748B] cursor-wait"
                  : "bg-white hover:bg-[#F8FAFC] text-[#172033] border border-[#CBD5E1]"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isExportingDocx ? "Exporting DOCX..." : "Download DOCX"}
            </button>
          </div>
        </div>
      </article>

      {/* Suggested Missing Keywords Panel (Visually Segregated) */}
      <MissingKeywordsPanel missingKeywords={missing_keywords} />
    </section>
  );
}
