"use client";

import React, { useState } from "react";
import { ContactInfo } from "@/types";

interface ContactEditorProps {
  initialContact: ContactInfo;
  onSave: (contact: ContactInfo) => void;
  onCancel: () => void;
}

export function ContactEditor({
  initialContact,
  onSave,
  onCancel,
}: ContactEditorProps) {
  const [fullName, setFullName] = useState(initialContact.full_name || "");
  const [email, setEmail] = useState(initialContact.email || "");
  const [phone, setPhone] = useState(initialContact.phone || "");
  const [location, setLocation] = useState(initialContact.location || "");
  const [linkedinUrl, setLinkedinUrl] = useState(initialContact.linkedin_url || "");
  const [githubUrl, setGithubUrl] = useState(initialContact.github_url || "");
  const [portfolioUrl, setPortfolioUrl] = useState(initialContact.portfolio_url || "");
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setError("Full name is required.");
      return;
    }
    setError(null);
    onSave({
      full_name: trimmedName,
      email: email.trim() || null,
      phone: phone.trim() || null,
      location: location.trim() || null,
      linkedin_url: linkedinUrl.trim() || null,
      github_url: githubUrl.trim() || null,
      portfolio_url: portfolioUrl.trim() || null,
    });
  };

  return (
    <div
      role="region"
      aria-label="Edit Contact Information"
      className="p-5 rounded-xl border border-[#4F6BED]/40 bg-[#F8FAFC] shadow-sm space-y-4 animate-in fade-in duration-200 text-left"
    >
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
        <h4 className="text-xs font-bold text-[#4F6BED] uppercase tracking-wider">
          Edit Contact Information
        </h4>
        <span className="text-[11px] text-[#64748B]">Personal Details & Links</span>
      </div>

      {error && (
        <p role="alert" className="text-xs text-[#C24141] font-medium">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label
            htmlFor="contact-full-name"
            className="block text-xs font-semibold text-[#172033] mb-1"
          >
            Full Name <span className="text-[#C24141]">*</span>
          </label>
          <input
            id="contact-full-name"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (error) setError(null);
            }}
            autoFocus
            className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
            placeholder="e.g. Jane Doe"
          />
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="block text-xs font-semibold text-[#172033] mb-1"
          >
            Email Address
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
            placeholder="e.g. jane.doe@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="contact-phone"
            className="block text-xs font-semibold text-[#172033] mb-1"
          >
            Phone Number
          </label>
          <input
            id="contact-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
            placeholder="e.g. +1 (555) 000-0000"
          />
        </div>

        <div>
          <label
            htmlFor="contact-location"
            className="block text-xs font-semibold text-[#172033] mb-1"
          >
            Location
          </label>
          <input
            id="contact-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
            placeholder="e.g. San Francisco, CA or Remote"
          />
        </div>

        <div>
          <label
            htmlFor="contact-linkedin"
            className="block text-xs font-semibold text-[#172033] mb-1"
          >
            LinkedIn Profile URL
          </label>
          <input
            id="contact-linkedin"
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
            placeholder="https://linkedin.com/in/janedoe"
          />
        </div>

        <div>
          <label
            htmlFor="contact-github"
            className="block text-xs font-semibold text-[#172033] mb-1"
          >
            GitHub Profile URL
          </label>
          <input
            id="contact-github"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
            placeholder="https://github.com/janedoe"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="contact-portfolio"
            className="block text-xs font-semibold text-[#172033] mb-1"
          >
            Portfolio / Personal Website URL
          </label>
          <input
            id="contact-portfolio"
            type="url"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
            placeholder="https://janedoe.dev"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
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
