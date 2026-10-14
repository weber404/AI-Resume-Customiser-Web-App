"use client";

import React, { useState } from "react";
import Link from "next/link";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How does AI Resume Tailor keep my resume truthful?",
    answer:
      "The AI operates strictly upon the documented experience extracted from your uploaded resume. If a job posting requires a skill or qualification not found in your background, it is safely isolated into the 'Suggested Missing Keywords' panel. It is never fabricated or quietly inserted into your employment history.",
  },
  {
    question: "Will the exported resumes pass Applicant Tracking Systems (ATS)?",
    answer:
      "Yes. Both our PDF and Word DOCX exports adhere to single-column ATS formatting standards. We avoid multi-column tables, text boxes, and complex graphics that confuse ATS parsers, while utilizing standard system typography and searchable text streams.",
  },
  {
    question: "What file formats can I upload and export?",
    answer:
      "You can upload standard text-selectable PDF (.pdf) or Word (.docx) documents up to 5 MB. You can export your customized resume as an ATS-compliant PDF or an editable Microsoft Word (.docx) file with zero watermarks.",
  },
  {
    question: "Is my personal data saved or used to train AI models?",
    answer:
      "No. All resume uploads and job descriptions are handled strictly in-memory (RAM) during your active session. Files are never stored on persistent disks, saved in a database, or added to training corpora.",
  },
  {
    question: "Can I edit the AI suggestions before downloading?",
    answer:
      "Absolutely. Our section-wise editor provides interactive pencil buttons across Contact Information, Professional Summary, Skills, Work Experience, Projects, Education, and Certifications so you have 100% final editorial control.",
  },
];

export default function LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] flex flex-col selection:bg-[#4F6BED]/20 selection:text-[#172033]">
      {/* Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="site-container px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[#172033] hover:opacity-90 transition-opacity shrink-0"
            aria-label="AI Resume Tailor Home"
          >
            <div
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4F6BED] to-[#6E85F7] flex items-center justify-center shadow-xs text-white font-semibold text-sm shrink-0"
              aria-hidden="true"
            >
              RT
            </div>
            <span className="font-semibold text-base sm:text-lg tracking-tight text-[#172033] shrink-0">
              AI Resume Tailor
            </span>
          </Link>

          {/* Navigation Links with added spacing on desktop & perfectly aligned on iPad Mini */}
          <nav className="hidden md:flex items-center justify-center gap-4 lg:gap-8 xl:gap-9 text-xs lg:text-sm font-medium text-[#64748B]">
            <a
              href="#how-it-works"
              className="hover:text-[#172033] hover:bg-[#EEF4FF]/70 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="hover:text-[#172033] hover:bg-[#EEF4FF]/70 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Features
            </a>
            <a
              href="#preview"
              className="hover:text-[#172033] hover:bg-[#EEF4FF]/70 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Editor Preview
            </a>
            <a
              href="#faq"
              className="hover:text-[#172033] hover:bg-[#EEF4FF]/70 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              FAQ
            </a>
          </nav>

          {/* Primary Navigation CTA */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/tailor"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#4F6BED] hover:bg-[#3D56D6] active:bg-[#3047C4] shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-[#4F6BED] whitespace-nowrap"
            >
              Start Tailoring
            </Link>

            {/* Mobile Hamburger toggle for small screens */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] border border-[#E2E8F0] transition-colors focus-visible:ring-2 focus-visible:ring-[#4F6BED]"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu when opened */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E2E8F0] bg-white px-4 pt-2.5 pb-4 space-y-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#172033] hover:bg-[#EEF4FF] hover:text-[#4F6BED] transition-colors"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#172033] hover:bg-[#EEF4FF] hover:text-[#4F6BED] transition-colors"
            >
              Features
            </a>
            <a
              href="#preview"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#172033] hover:bg-[#EEF4FF] hover:text-[#4F6BED] transition-colors"
            >
              Editor Preview
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#172033] hover:bg-[#EEF4FF] hover:text-[#4F6BED] transition-colors"
            >
              FAQ
            </a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28 bg-gradient-to-b from-[#F7F9FC] via-[#EEF4FF]/40 to-[#F2F0FF]/30 border-b border-[#E2E8F0]">
        <div className="site-container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Copy & Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EEF4FF] text-[#4F6BED] border border-[#E2E8F0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F6BED]" aria-hidden="true" />
                AI-POWERED RESUME TAILORING
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#172033] leading-[1.1]">
                One Resume. <br className="hidden sm:inline" />
                <span className="text-[#4F6BED]">Every Opportunity.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Tailor your resume to each job description with AI. Highlight relevant experience,
                identify keyword gaps, and customize your resume before downloading it.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/tailor"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-white bg-[#4F6BED] hover:bg-[#3D56D6] active:bg-[#3047C4] shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#4F6BED]"
                >
                  <span>Start Tailoring Your Resume</span>
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
                </Link>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-base font-semibold text-[#172033] bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-[#4F6BED]"
                >
                  See How It Works
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-[#E2E8F0]/80 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-[#64748B]">
                <div className="flex items-center gap-1.5 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#16845B]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>100% Truth-Preserving</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#16845B]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>In-Memory Privacy Guarantee</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#16845B]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Single-Column ATS Layout</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Product Preview */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Card Container mimicking the tailored view */}
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xl space-y-5">
                  {/* Card Header & Simulated Match Score */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                    <div>
                      <h2 className="text-base font-bold text-[#172033]">Alex Morgan</h2>
                      <p className="text-xs text-[#64748B]">Staff Backend Engineer</p>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#16845B] border border-[#A7F3D0]">
                        <span>94%</span>
                        <span className="font-normal text-[10px]">Match</span>
                      </div>
                    </div>
                  </div>

                  {/* Highlighted Match Tags */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4F6BED]">
                      Matched Skills &amp; Stack
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {["Python", "FastAPI", "Distributed Systems", "PostgreSQL", "Docker", "AWS"].map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#EEF4FF] text-[#4F6BED] border border-[#E2E8F0]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience Snippet with AI Realigned Bullet */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#172033]">Lead Architect &mdash; Nova Cloud</span>
                      <span className="text-[#64748B] font-mono text-[11px]">2021 &ndash; Present</span>
                    </div>
                    <p className="text-xs text-[#334155] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] leading-relaxed">
                      &bull; Architected distributed FastAPI microservices handling 15M daily requests with sub-10ms P99 latency and 99.99% availability.
                    </p>
                  </div>

                  {/* Isolated Missing Keyword Notice */}
                  <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[11px] text-[#92400E] space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Verified Keyword Gap Detected:</span>
                      <span className="uppercase text-[9px] bg-[#FEF3C7] px-1.5 py-0.5 rounded border border-[#FDE68A]">
                        Candidate Check
                      </span>
                    </div>
                    <p className="text-[#92400E]/90 leading-tight">
                      &quot;Kubernetes&quot; appeared in the job description but was not in your resume. It was <strong>not</strong> added to preserve truthfulness.
                    </p>
                  </div>

                  {/* Actions preview */}
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#E2E8F0]">
                    <span className="text-[11px] text-[#64748B]">Ready to export:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#4F6BED] text-white">
                        PDF
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#F1F5F9] text-[#172033] border border-[#E2E8F0]">
                        DOCX
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits and Value Proposition */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#E2E8F0]">
        <div className="site-container px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4F6BED]">
              CORE ADVANTAGES
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#172033]">
              Designed for Professional Integrity
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
              Recruiters and hiring managers spot AI-generated hallucinations instantly. Our system focuses on relevance, clarity, and truthful alignment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] border border-[#E2E8F0] flex items-center justify-center text-[#4F6BED]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#172033]">Zero Hallucinations</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                The AI reorganizes and reframes only your verified experience. It never invents companies, dates, degrees, or unearned achievements.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#B45309]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#172033]">Keyword Gap Isolation</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Missing job skills are identified and presented in an honest review panel so you decide whether to include them based on real experience.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F2F0FF] border border-[#E2E8F0] flex items-center justify-center text-[#4F6BED]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#172033]">Section-Wise Editing</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Retain full control over every word. Edit contact info, summaries, bullets, technologies, education, and credentials before export.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#16845B]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#172033]">In-Memory Privacy</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                No database. No user tracking. Your documents reside only in ephemeral server memory during the request and disappear immediately after.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three-step "How It Works" Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-[#EEF4FF]/50 border-b border-[#E2E8F0]">
        <div className="site-container px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4F6BED]">
              TRANSPARENT PROCESS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#172033]">
              How It Works in 3 Clear Steps
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
              From uploading your current resume to downloading an ATS-ready version in less than a minute.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-xs space-y-4 relative">
              <span className="w-10 h-10 rounded-xl bg-[#4F6BED] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                01
              </span>
              <h3 className="text-lg font-bold text-[#172033]">Upload Existing Resume</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Choose your existing resume in PDF or Word (.docx) format. The parser cleanly validates structure and selectable text without saving files to disk.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-xs space-y-4 relative">
              <span className="w-10 h-10 rounded-xl bg-[#4F6BED] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                02
              </span>
              <h3 className="text-lg font-bold text-[#172033]">Paste Target Job Posting</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Provide the full job description. The AI analyzes requirements, aligns relevant achievements, and highlights gaps for your personal review.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-xs space-y-4 relative">
              <span className="w-10 h-10 rounded-xl bg-[#4F6BED] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                03
              </span>
              <h3 className="text-lg font-bold text-[#172033]">Review, Edit &amp; Export</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Review your tailored document, make fine-grained manual adjustments using in-line pencil editors, and download an ATS-compliant PDF or DOCX file.
              </p>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link
              href="/tailor"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#4F6BED] hover:bg-[#3D56D6] transition-colors shadow-xs"
            >
              <span>Try the Tailoring Workflow Now</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards Deep Dive */}
      <section id="features" className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0]">
        <div className="site-container px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4F6BED]">
              PRODUCT CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#172033]">
              Every Tool You Need for a Winning Resume
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
              Built deliberately to give job seekers maximum precision, ATS compatibility, and professional control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] border border-[#E2E8F0] flex items-center justify-center text-[#4F6BED]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#172033]">Targeted Bullet Alignment</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Job descriptions emphasize specific outcomes, methodologies, and technologies. The tailoring engine reframes your proven achievements so hiring algorithms and recruiters recognize your direct qualifications immediately.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#B45309]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#172033]">Keyword Gap Analysis</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Rather than guessing which terms matter, our analyzer identifies unevidenced keywords from the target posting and suggests how you can honestly bridge those gaps before final interview stages.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#F2F0FF] border border-[#E2E8F0] flex items-center justify-center text-[#4F6BED]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#172033]">Full In-Line Section Editor</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Unlike rigid generator tools, you never get locked into AI output. Click the pencil icon on any section to reword sentences, modify dates, insert new technologies, or discard edits on demand.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#16845B]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#172033]">Native PDF &amp; DOCX Export</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Export in either format instantly. Our ReportLab PDF engine outputs pure selectable text streams with standard typography, and our python-docx generator produces clean Word documents with zero formatting bloat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Editor Preview Section */}
      <section id="preview" className="py-16 sm:py-24 bg-[#F2F0FF]/40 border-b border-[#E2E8F0]">
        <div className="site-container px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4F6BED]">
              INLINE RESUME EDITOR
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#172033]">
              Section-by-Section Control Before You Export
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
              Every section has an in-line editor. Fine-tune any sentence, adjust dates, or add bullets with a single click.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-10 shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <span className="text-xs font-semibold text-[#4F6BED] uppercase tracking-wider">
                  Live Editor Demo
                </span>
                <h3 className="text-lg font-bold text-[#172033]">Professional Summary Section</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EEF4FF] text-[#4F6BED]">
                  Active Edit Mode
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-[#4F6BED]/40 bg-[#F8FAFC] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#4F6BED] uppercase tracking-wider">
                  Edit Professional Summary
                </label>
                <span className="text-[11px] text-[#64748B]">186 characters</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#CBD5E1] text-xs sm:text-sm text-[#172033] leading-relaxed font-sans shadow-xs">
                Results-driven Staff Engineer with 8+ years designing scalable microservices in Python, FastAPI, and TypeScript. Proven track record leading cloud migrations and optimizing P99 latency.
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#64748B] border border-[#E2E8F0]">
                  Cancel editing
                </span>
                <span className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#4F6BED] text-white shadow-xs">
                  Save changes
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
              <span>Changes are immediately rendered into the document view and included in your downloaded PDF or DOCX file.</span>
              <Link
                href="/tailor"
                className="shrink-0 text-xs font-semibold text-[#4F6BED] hover:underline"
              >
                Experience the editor &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section id="faq" className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4F6BED]">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#172033]">
              Clear Answers to Common Questions
            </h2>
            <p className="text-sm sm:text-base text-[#64748B]">
              Everything you need to know about tailoring, ATS parsing, and privacy.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-[#172033] hover:text-[#4F6BED] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none"
                  >
                    <span>{faq.question}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-5 h-5 text-[#64748B] transition-transform duration-200 shrink-0 ml-4 ${isOpen ? "transform rotate-180 text-[#4F6BED]" : ""
                        }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#64748B] leading-relaxed border-t border-[#E2E8F0]/60">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="py-16 sm:py-24 bg-[#EEF4FF] border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-[#4F6BED] border border-[#E2E8F0] shadow-xs">
            READY TO STAND OUT?
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#172033]">
            Start Tailoring Your Resume in Seconds
          </h2>

          <p className="text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Free yourself from generic job applications. Highlight exactly what matters for your target position without compromising honesty.
          </p>

          <div className="pt-2">
            <Link
              href="/tailor"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white bg-[#4F6BED] hover:bg-[#3D56D6] active:bg-[#3047C4] shadow-md transition-all focus-visible:ring-2 focus-visible:ring-[#4F6BED]"
            >
              <span>Start Tailoring Your Resume</span>
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
            </Link>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-white py-12 border-t border-[#E2E8F0]">
        <div className="site-container px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#4F6BED] to-[#6E85F7] flex items-center justify-center text-white font-semibold text-xs shadow-xs"
                aria-hidden="true"
              >
                RT
              </div>
              <span className="font-semibold text-base text-[#172033]">
                AI Resume Tailor
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs text-[#64748B]">
              <Link href="/tailor" className="hover:text-[#172033] transition-colors">
                Workspace
              </Link>
              <a href="#how-it-works" className="hover:text-[#172033] transition-colors">
                How It Works
              </a>
              <a href="#features" className="hover:text-[#172033] transition-colors">
                Features
              </a>
              <a href="#faq" className="hover:text-[#172033] transition-colors">
                FAQ
              </a>
            </div>
          </div>

          <div className="border-t border-[#F1F5F9] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
            <p>
              &copy; 2026 AI Resume Tailor. Ephemeral In-Memory Document Processing.
            </p>
            <p>
              Resume documents are never saved to disk or used for machine learning training.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
