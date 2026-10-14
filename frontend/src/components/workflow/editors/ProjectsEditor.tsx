"use client";

import React, { useState } from "react";
import { ProjectItem } from "@/types";

interface ProjectsEditorProps {
  initialProjects: ProjectItem[];
  onSave: (projects: ProjectItem[]) => void;
  onCancel: () => void;
}

interface EditableProjectItem {
  id: string;
  title: string;
  description: string;
  url: string;
  bullet_points: string[];
  technologiesRaw: string;
}

export function ProjectsEditor({
  initialProjects,
  onSave,
  onCancel,
}: ProjectsEditorProps) {
  const [items, setItems] = useState<EditableProjectItem[]>(() =>
    initialProjects.length > 0
      ? initialProjects.map((p, idx) => ({
          id: `proj-${idx}-${Date.now()}`,
          title: p.title,
          description: p.description || "",
          url: p.url || "",
          bullet_points: p.bullet_points.length > 0 ? [...p.bullet_points] : [""],
          technologiesRaw: p.technologies_used ? p.technologies_used.join(", ") : "",
        }))
      : [
          {
            id: `proj-0-${Date.now()}`,
            title: "",
            description: "",
            url: "",
            bullet_points: [""],
            technologiesRaw: "",
          },
        ]
  );

  const [error, setError] = useState<string | null>(null);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `proj-${prev.length}-${Date.now()}`,
        title: "",
        description: "",
        url: "",
        bullet_points: [""],
        technologiesRaw: "",
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      setError("Resume should contain at least one project entry.");
      return;
    }
    setError(null);
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const handleChangeField = (
    id: string,
    field: keyof EditableProjectItem,
    value: string
  ) => {
    if (error) setError(null);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleBulletChange = (itemId: string, bulletIdx: number, value: string) => {
    if (error) setError(null);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const newBullets = [...item.bullet_points];
        newBullets[bulletIdx] = value;
        return { ...item, bullet_points: newBullets };
      })
    );
  };

  const handleAddBullet = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        return { ...item, bullet_points: [...item.bullet_points, ""] };
      })
    );
  };

  const handleRemoveBullet = (itemId: string, bulletIdx: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        if (item.bullet_points.length === 1) {
          return { ...item, bullet_points: [""] };
        }
        return {
          ...item,
          bullet_points: item.bullet_points.filter((_, idx) => idx !== bulletIdx),
        };
      })
    );
  };

  const handleSave = () => {
    const cleaned: ProjectItem[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const trimmedTitle = item.title.trim();

      if (!trimmedTitle) {
        setError(`Project #${i + 1} must have a title or name.`);
        return;
      }

      const validBullets = item.bullet_points
        .map((b) => b.trim())
        .filter(Boolean);

      const technologies = item.technologiesRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      cleaned.push({
        title: trimmedTitle,
        description: item.description.trim() || null,
        url: item.url.trim() || null,
        bullet_points: validBullets,
        technologies_used: technologies.length > 0 ? technologies : undefined,
      });
    }

    if (cleaned.length === 0) {
      setError("Please add at least one valid project entry.");
      return;
    }

    setError(null);
    onSave(cleaned);
  };

  return (
    <div
      role="region"
      aria-label="Edit Projects"
      className="p-5 rounded-xl border border-[#4F6BED]/40 bg-[#F8FAFC] shadow-sm space-y-5 animate-in fade-in duration-200 text-left"
    >
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
        <h4 className="text-xs font-bold text-[#4F6BED] uppercase tracking-wider">
          Edit Key Projects
        </h4>
        <span className="text-[11px] text-[#64748B]">
          Edit titles, descriptions, stack, and results
        </span>
      </div>

      {error && (
        <p role="alert" className="text-xs text-[#C24141] font-medium">
          {error}
        </p>
      )}

      <div className="space-y-5">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
              <span className="text-xs font-bold text-[#172033]">
                Project #{idx + 1}
                {item.title ? `: ${item.title}` : ""}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                aria-label={`Remove project ${item.title || `#${idx + 1}`}`}
                className="text-xs text-[#C24141] hover:text-[#991B1B] hover:underline cursor-pointer"
              >
                Remove Project
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor={`proj-title-${item.id}`}
                  className="block text-xs font-semibold text-[#172033] mb-1"
                >
                  Project Title / Name <span className="text-[#C24141]">*</span>
                </label>
                <input
                  id={`proj-title-${item.id}`}
                  type="text"
                  value={item.title}
                  onChange={(e) => handleChangeField(item.id, "title", e.target.value)}
                  placeholder="e.g. Distributed Task Queue"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`proj-url-${item.id}`}
                  className="block text-xs font-semibold text-[#172033] mb-1"
                >
                  Demo / Repository URL
                </label>
                <input
                  id={`proj-url-${item.id}`}
                  type="url"
                  value={item.url}
                  onChange={(e) => handleChangeField(item.id, "url", e.target.value)}
                  placeholder="https://github.com/username/project"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor={`proj-desc-${item.id}`}
                className="block text-xs font-semibold text-[#172033] mb-1"
              >
                Description / Overview
              </label>
              <textarea
                id={`proj-desc-${item.id}`}
                rows={2}
                value={item.description}
                onChange={(e) => handleChangeField(item.id, "description", e.target.value)}
                placeholder="High-level summary of architecture, goals, or purpose..."
                className="w-full p-2.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none resize-y"
              />
            </div>

            {/* Bullet Points */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#475569] uppercase tracking-wide">
                  Project Highlights & Accomplishments (Bullet Points)
                </span>
                <button
                  type="button"
                  onClick={() => handleAddBullet(item.id)}
                  className="text-xs text-[#4F6BED] hover:text-[#3D56D6] hover:underline cursor-pointer font-medium"
                >
                  + Add Bullet
                </button>
              </div>

              {item.bullet_points.map((bullet, bIdx) => (
                <div key={bIdx} className="flex items-start gap-2">
                  <span className="text-[#64748B] text-xs pt-2">&bull;</span>
                  <textarea
                    rows={2}
                    value={bullet}
                    onChange={(e) => handleBulletChange(item.id, bIdx, e.target.value)}
                    placeholder="Describe specific feature, technical challenge, or result..."
                    className="w-full p-2 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none resize-y leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveBullet(item.id, bIdx)}
                    aria-label={`Remove bullet point ${bIdx + 1} from ${item.title || "project"}`}
                    className="p-1.5 rounded text-[#94A3B8] hover:text-[#C24141] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Technologies */}
            <div>
              <label
                htmlFor={`proj-tech-${item.id}`}
                className="block text-[11px] font-medium text-[#64748B] mb-1"
              >
                Technologies / Stack (comma-separated)
              </label>
              <input
                id={`proj-tech-${item.id}`}
                type="text"
                value={item.technologiesRaw}
                onChange={(e) => handleChangeField(item.id, "technologiesRaw", e.target.value)}
                placeholder="e.g. Next.js, TypeScript, PostgreSQL, Tailwind CSS"
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#172033] text-xs focus:border-[#4F6BED] focus:ring-2 focus:ring-[#4F6BED]/20 focus:outline-none"
              />
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
          Add Project
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
