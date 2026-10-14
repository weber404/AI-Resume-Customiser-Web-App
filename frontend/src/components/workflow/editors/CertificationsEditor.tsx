"use client";

import React, { useState } from "react";
import { CertificationItem } from "@/types";

interface CertificationsEditorProps {
  initialCertifications: CertificationItem[];
  onSave: (certifications: CertificationItem[]) => void;
  onCancel: () => void;
}

interface EditableCertItem {
  id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiration_date: string;
  credential_id: string;
  url: string;
}

export function CertificationsEditor({
  initialCertifications,
  onSave,
  onCancel,
}: CertificationsEditorProps) {
  const [items, setItems] = useState<EditableCertItem[]>(() =>
    initialCertifications.length > 0
      ? initialCertifications.map((c, idx) => ({
          id: `cert-${idx}-${Date.now()}`,
          name: c.name,
          issuer: c.issuer,
          issue_date: c.issue_date || "",
          expiration_date: c.expiration_date || "",
          credential_id: c.credential_id || "",
          url: c.url || "",
        }))
      : [
          {
            id: `cert-0-${Date.now()}`,
            name: "",
            issuer: "",
            issue_date: "",
            expiration_date: "",
            credential_id: "",
            url: "",
          },
        ]
  );

  const [error, setError] = useState<string | null>(null);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `cert-${prev.length}-${Date.now()}`,
        name: "",
        issuer: "",
        issue_date: "",
        expiration_date: "",
        credential_id: "",
        url: "",
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      setError("Resume should contain at least one certification entry, or cancel to keep original.");
      return;
    }
    setError(null);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleChangeField = (
    id: string,
    field: keyof EditableCertItem,
    value: string
  ) => {
    if (error) setError(null);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = () => {
    const cleaned: CertificationItem[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const trimmedName = item.name.trim();
      const trimmedIssuer = item.issuer.trim();

      if (!trimmedName) {
        setError(`Certification #${i + 1} must have a certification name.`);
        return;
      }
      if (!trimmedIssuer) {
        setError(`Certification #${i + 1} must have an issuing organization.`);
        return;
      }

      cleaned.push({
        name: trimmedName,
        issuer: trimmedIssuer,
        issue_date: item.issue_date.trim() || null,
        expiration_date: item.expiration_date.trim() || null,
        credential_id: item.credential_id.trim() || null,
        url: item.url.trim() || null,
      });
    }

    if (cleaned.length === 0) {
      setError("Please add at least one valid certification.");
      return;
    }

    setError(null);
    onSave(cleaned);
  };

  return (
    <div
      role="region"
      aria-label="Edit Certifications"
      className="p-5 rounded-xl border border-[#4F6BED]/40 bg-[#F8FAFC] shadow-sm space-y-5 animate-in fade-in duration-200 text-left"
    >
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
        <h4 className="text-xs font-bold text-[#4F6BED] uppercase tracking-wider">
          Edit Certifications
        </h4>
        <span className="text-[11px] text-[#64748B]">
          Edit credential name, issuer, dates, and ID
        </span>
      </div>

      {error && (
        <p role="alert" className="text-xs text-[#C24141] font-medium">
          {error}
        </p>
      )}

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
              <span className="text-xs font-bold text-[#172033]">
                Certification #{idx + 1}
                {item.name ? `: ${item.name}` : ""}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                aria-label={`Remove certification ${item.name || `#${idx + 1}`}`}
                className="text-xs text-[#C24141] hover:text-[#991B1B] hover:underline cursor-pointer"
              >
                Remove Entry
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor={`cert-name-${item.id}`}
                  className="block text-xs font-semibold text-[#172033] mb-1"
                >
                  Certification Name <span className="text-[#C24141]">*</span>
                </label>
                <input
                  id={`cert-name-${item.id}`}
                  type="text"
                  value={item.name}
                  onChange={(e) => handleChangeField(item.id, "name", e.target.value)}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`cert-issuer-${item.id}`}
                  className="block text-xs font-semibold text-[#172033] mb-1"
                >
                  Issuer <span className="text-[#C24141]">*</span>
                </label>
                <input
                  id={`cert-issuer-${item.id}`}
                  type="text"
                  value={item.issuer}
                  onChange={(e) => handleChangeField(item.id, "issuer", e.target.value)}
                  placeholder="e.g. Amazon Web Services"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`cert-issue-${item.id}`}
                  className="block text-xs font-semibold text-[#172033] mb-1"
                >
                  Issue Date
                </label>
                <input
                  id={`cert-issue-${item.id}`}
                  type="text"
                  value={item.issue_date}
                  onChange={(e) => handleChangeField(item.id, "issue_date", e.target.value)}
                  placeholder="e.g. Mar 2022"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`cert-exp-${item.id}`}
                  className="block text-xs font-semibold text-[#172033] mb-1"
                >
                  Expiration Date
                </label>
                <input
                  id={`cert-exp-${item.id}`}
                  type="text"
                  value={item.expiration_date}
                  onChange={(e) => handleChangeField(item.id, "expiration_date", e.target.value)}
                  placeholder="e.g. Mar 2025 or Never"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`cert-id-${item.id}`}
                  className="block text-xs font-semibold text-[#172033] mb-1"
                >
                  Credential ID (optional)
                </label>
                <input
                  id={`cert-id-${item.id}`}
                  type="text"
                  value={item.credential_id}
                  onChange={(e) => handleChangeField(item.id, "credential_id", e.target.value)}
                  placeholder="e.g. AWS-1234567"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`cert-url-${item.id}`}
                  className="block text-xs font-semibold text-[#172033] mb-1"
                >
                  Verification URL (optional)
                </label>
                <input
                  id={`cert-url-${item.id}`}
                  type="url"
                  value={item.url}
                  onChange={(e) => handleChangeField(item.id, "url", e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#EEF4FF] text-[#4F6BED] border border-[#E2E8F0] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none shadow-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Certification
        </button>

        <div className="flex items-center gap-2">
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
    </div>
  );
}
