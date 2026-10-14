"use client";

import React, { useState } from "react";
import { SkillCategory } from "@/types";

interface SkillsEditorProps {
  initialSkills: SkillCategory[];
  onSave: (skills: SkillCategory[]) => void;
  onCancel: () => void;
}

interface EditableCategory {
  id: string;
  category: string;
  skillsRaw: string;
}

export function SkillsEditor({
  initialSkills,
  onSave,
  onCancel,
}: SkillsEditorProps) {
  const [categories, setCategories] = useState<EditableCategory[]>(() =>
    initialSkills.length > 0
      ? initialSkills.map((c, idx) => ({
          id: `cat-${idx}-${Date.now()}`,
          category: c.category,
          skillsRaw: c.skills.join(", "),
        }))
      : [
          {
            id: `cat-0-${Date.now()}`,
            category: "Technical Skills",
            skillsRaw: "",
          },
        ]
  );
  const [error, setError] = useState<string | null>(null);

  const handleAddCategory = () => {
    setCategories((prev) => [
      ...prev,
      {
        id: `cat-${prev.length}-${Date.now()}`,
        category: "",
        skillsRaw: "",
      },
    ]);
  };

  const handleRemoveCategory = (id: string) => {
    if (categories.length === 1) {
      setError("Resume should contain at least one skill category.");
      return;
    }
    setError(null);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleChangeCategory = (id: string, field: "category" | "skillsRaw", value: string) => {
    if (error) setError(null);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSave = () => {
    const cleaned: SkillCategory[] = [];

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const trimmedCategory = cat.category.trim();
      const parsedSkills = cat.skillsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (!trimmedCategory) {
        setError(`Category #${i + 1} name cannot be empty.`);
        return;
      }

      if (parsedSkills.length === 0) {
        setError(`Category "${trimmedCategory}" must include at least one skill.`);
        return;
      }

      cleaned.push({
        category: trimmedCategory,
        skills: parsedSkills,
      });
    }

    if (cleaned.length === 0) {
      setError("Please add at least one valid skill category.");
      return;
    }

    setError(null);
    onSave(cleaned);
  };

  return (
    <div
      role="region"
      aria-label="Edit Technical Skills"
      className="p-5 rounded-xl border border-[#4F6BED]/40 bg-[#F8FAFC] shadow-sm space-y-4 animate-in fade-in duration-200 text-left"
    >
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
        <h4 className="text-xs font-bold text-[#4F6BED] uppercase tracking-wider">
          Edit Technical & Professional Skills
        </h4>
        <span className="text-[11px] text-[#64748B]">
          Separate multiple skills with commas
        </span>
      </div>

      {error && (
        <p role="alert" className="text-xs text-[#C24141] font-medium">
          {error}
        </p>
      )}

      <div className="space-y-4">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] space-y-2.5 shadow-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor={`skill-cat-name-${cat.id}`}
                className="text-xs font-semibold text-[#172033]"
              >
                Category Name <span className="text-[#64748B] font-normal">#{idx + 1}</span>
              </label>
              <button
                type="button"
                onClick={() => handleRemoveCategory(cat.id)}
                aria-label={`Remove skill category ${cat.category || `#${idx + 1}`}`}
                className="text-xs text-[#C24141] hover:text-[#991B1B] hover:underline cursor-pointer"
              >
                Remove Category
              </button>
            </div>

            <input
              id={`skill-cat-name-${cat.id}`}
              type="text"
              value={cat.category}
              onChange={(e) => handleChangeCategory(cat.id, "category", e.target.value)}
              placeholder="e.g. Languages & Frameworks, Databases, Cloud & DevOps"
              className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
            />

            <div>
              <label
                htmlFor={`skill-cat-items-${cat.id}`}
                className="block text-[11px] font-medium text-[#64748B] mb-1"
              >
                Skills (comma-separated)
              </label>
              <input
                id={`skill-cat-items-${cat.id}`}
                type="text"
                value={cat.skillsRaw}
                onChange={(e) => handleChangeCategory(cat.id, "skillsRaw", e.target.value)}
                placeholder="e.g. Python, FastAPI, Docker, PostgreSQL, Redis"
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
        <button
          type="button"
          onClick={handleAddCategory}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#EEF4FF] text-[#4F6BED] border border-[#E2E8F0] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none shadow-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Skill Category
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
