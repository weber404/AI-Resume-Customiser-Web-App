"use client";

import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { formatFileSize } from "@/lib/validation";

export interface FileUploadZoneHandle {
  focus: () => void;
}

interface FileUploadZoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  error: string | null;
  disabled?: boolean;
}

export const FileUploadZone = forwardRef<FileUploadZoneHandle, FileUploadZoneProps>(
  function FileUploadZone({ file, onFileSelect, error, disabled = false }, ref) {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const dropzoneRef = useRef<HTMLDivElement | null>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (!file) {
          dropzoneRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      },
    }));

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFile = e.dataTransfer.files[0];
        onFileSelect(droppedFile);
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFileSelect(e.target.files[0]);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        inputRef.current?.click();
      }
    };

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onFileSelect(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setTimeout(() => dropzoneRef.current?.focus(), 50);
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="resume-file-input" className="block text-sm font-semibold text-[#172033]">
            Upload Resume <span className="text-[#C24141]" aria-hidden="true">*</span>
          </label>
          <span className="text-xs text-[#64748B] font-medium">PDF or DOCX (Max 5 MB)</span>
        </div>

        {/* Hidden native input for accessible file picking */}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          disabled={disabled}
          className="sr-only"
          id="resume-file-input"
          aria-label="Upload resume file in PDF or DOCX format"
          aria-invalid={!!error}
          aria-describedby={error ? "resume-file-error" : undefined}
        />

        {!file ? (
          <div
            ref={dropzoneRef}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label="Upload resume file dropzone. Click or press Enter or Space to choose a file."
            aria-describedby={error ? "resume-file-error" : undefined}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onKeyDown={handleKeyDown}
            onClick={() => !disabled && inputRef.current?.click()}
            className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none ${
              disabled
                ? "opacity-50 cursor-not-allowed border-[#E2E8F0] bg-[#F8FAFC]"
                : isDragging
                ? "border-[#4F6BED] bg-[#EEF4FF] scale-[0.99]"
                : error
                ? "border-[#C24141]/50 bg-[#FEF2F2] hover:border-[#C24141]"
                : "border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#4F6BED]/60 hover:bg-[#EEF4FF]/30"
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#4F6BED] shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-[#172033]">
                  <span className="text-[#4F6BED] font-semibold underline underline-offset-2">Click to choose</span> or drag & drop
                </p>
                <p className="text-xs text-[#64748B]">
                  Select your existing resume in PDF (.pdf) or Word (.docx) format
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`flex items-center justify-between p-4 rounded-xl border ${
              error
                ? "border-[#C24141]/40 bg-[#FEF2F2]"
                : "border-[#E2E8F0] bg-white shadow-sm"
            } transition-all`}
          >
            <div className="flex items-center space-x-3.5 min-w-0">
              <div
                className="w-10 h-10 rounded-lg bg-[#EEF4FF] border border-[#E2E8F0] flex items-center justify-center text-[#4F6BED] shrink-0 font-bold text-xs uppercase"
                aria-hidden="true"
              >
                {file.name.endsWith(".pdf") ? "PDF" : "DOCX"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#172033] truncate max-w-xs sm:max-w-md">
                  {file.name}
                </p>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {formatFileSize(file.size)} &bull; Ready for extraction
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                onClick={() => !disabled && inputRef.current?.click()}
                disabled={disabled}
                aria-label={`Replace file ${file.name}`}
                className="text-xs font-medium text-[#64748B] hover:text-[#172033] px-2.5 py-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#4F6BED] focus-visible:outline-none"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                aria-label={`Remove file ${file.name}`}
                className="text-xs font-medium text-[#C24141] hover:text-[#991B1B] px-2.5 py-1.5 rounded-lg hover:bg-[#FEF2F2] transition-colors disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C24141] focus-visible:outline-none"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {error && (
          <p
            id="resume-file-error"
            role="alert"
            aria-live="polite"
            className="text-xs text-[#C24141] flex items-center gap-1.5 mt-1 font-medium"
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
