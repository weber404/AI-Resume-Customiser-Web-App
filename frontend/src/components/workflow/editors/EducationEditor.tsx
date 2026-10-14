"use client";

import React, { useState } from "react";
import { EducationItem } from "@/types";

interface EducationEditorProps {
  initialEducation: EducationItem[];
  onSave: (education: EducationItem[]) => void;
  onCancel: () => void;
}

interface EditableEducationItem {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  gpa: string;
}

export function EducationEditor({
  initialEducation,
  onSave,
  onCancel,
}: EducationEditorProps) {
  const [items, setItems] = useState<EditableEducationItem[]>(() =>
    initialEducation.length > 0
      ? initialEducation.map((edu, idx) => ({
          id: `edu-${idx}-${Date.now()}`,
          institution: edu.institution,
          degree: edu.degree,
          field_of_study: edu.field_of_study || "",
          start_date: edu.start_date || "",
          end_date: edu.end_date || "",
          gpa: edu.gpa || "",
        }))
      : [
          {
            id: `edu-0-${Date.now()}`,
            institution: "",
            degree: "",
            field_of_study: "",
            start_date: "",
            end_date: "",
            gpa: "",
          },
        ]
  );

  const [error, setError] = useState<string | null>(null);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `edu-${prev.length}-${Date.now()}`,
        institution: "",
        degree: "",
        field_of_study: "",
        start_date: "",
        end_date: "",
        gpa: "",
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      setError("Resume should contain at least one education entry.");
      return;
    }
    setError(null);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleChangeField = (
    id: string,
    field: keyof EditableEducationItem,
    value: string
  ) => {
    if (error) setError(null);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = () => {
    const cleaned: EducationItem[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const trimmedInst = item.institution.trim();
      const trimmedDeg = item.degree.trim();

      if (!trimmedInst) {
        setError(`Education #${i + 1} must have an institution/university name.`);
        return;
      }
      if (!trimmedDeg) {
        setError(`Education #${i + 1} must have a degree title (e.g. "B.S. in Computer Science").`);
        return;
      }

      cleaned.push({
        institution: trimmedInst,
        degree: trimmedDeg,
        field_of_study: item.field_of_study.trim() || null,
        start_date: item.start_date.trim() || null,
        end_date: item.end_date.trim() || null,
        gpa: item.gpa.trim() || null,
      });
    }

    if (cleaned.length === 0) {
      setError("Please add at least one valid education entry.");
      return;
    }

    setError(null);
    onSave(cleaned);
  };

  return (
    <div
      role="region"
      aria-label="Edit Education"
      className="p-5 rounded-xl border border-[#4F6BED]/40 bg-[#F8FAFC] shadow-sm space-y-5 animate-in fade-in duration-200 text-left"
    >
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
        <h4 className="text-xs font-bold text-[#4F6BED] uppercase tracking-wider">
          Edit Education
        </h4>
        <span className="text-[11px] text-[#64748B]">
          Edit institution, degree, field of study, and dates
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
                Education #{idx + 1}
                {item.institution ? `: ${item.institution}` : ""}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                aria-label={`Remove education ${item.institution || `#${idx + 1}`}`}
                className="text-xs text-[#C24141] hover:text-[#991B1B] hover:underline cursor-pointer"
              >
                Remove Entry
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor={`edu-inst-${item.id}`}
                  className="block text-xs font-semibold text-[#172033] mb-1"
                >
                  Institution / University <span className="text-[#C24141]">*</span>
                </label>
                <input
                  id={`edu-inst-${item.id}`}
                  type="text"
                  value={item.institution}
                  onChange={(e) => handleChangeField(item.id, "institution", e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`edu-deg-${item.id}`}
                  className="block text-xs font-semibold text-[#172033] mb-1"
                >
                  Degree <span className="text-[#C24141]">*</span>
                </label>
                <input
                  id={`edu-deg-${item.id}`}
                  type="text"
                  value={item.degree}
                  onChange={(e) => handleChangeField(item.id, "degree", e.target.value)}
                  placeholder="e.g. Bachelor of Science"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`edu-field-${item.id}`}
                  className="block text-xs font-semibold text-[#172033] mb-1"
                >
                  Field of Study / Major
                </label>
                <input
                  id={`edu-field-${item.id}`}
                  type="text"
                  value={item.field_of_study}
                  onChange={(e) => handleChangeField(item.id, "field_of_study", e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`edu-gpa-${item.id}`}
                  className="block text-xs font-semibold text-[#172033] mb-1"
                >
                  GPA (optional)
                </label>
                <input
                  id={`edu-gpa-${item.id}`}
                  type="text"
                  value={item.gpa}
                  onChange={(e) => handleChangeField(item.id, "gpa", e.target.value)}
                  placeholder="e.g. 3.8 / 4.0"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`edu-start-${item.id}`}
                  className="block text-xs font-semibold text-[#172033] mb-1"
                >
                  Start Date
                </label>
                <input
                  id={`edu-start-${item.id}`}
                  type="text"
                  value={item.start_date}
                  onChange={(e) => handleChangeField(item.id, "start_date", e.target.value)}
                  placeholder="e.g. Sep 2016"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`edu-end-${item.id}`}
                  className="block text-xs font-semibold text-[#172033] mb-1"
                >
                  Graduation / End Date
                </label>
                <input
                  id={`edu-end-${item.id}`}
                  type="text"
                  value={item.end_date}
                  onChange={(e) => handleChangeField(item.id, "end_date", e.target.value)}
                  placeholder="e.g. Jun 2020"
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
          Add Education
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
