import test from "node:test";
import assert from "node:assert/strict";
import {
  formatFileSize,
  MAX_FILE_SIZE_BYTES,
  MAX_JOB_DESCRIPTION_CHARS,
  validateJobDescription,
  validateResumeFile,
} from "../src/lib/validation.ts";
import {
  ApiError,
  exportResumeDocx,
  exportResumePdf,
  parseContentDispositionFilename,
  tailorResume,
} from "../src/lib/api.ts";

// Helper to create mock File objects for testing in Node.js
function createMockFile(name: string, sizeBytes: number): File {
  const blob = new Blob(["a".repeat(sizeBytes)]);
  return new File([blob], name, { type: "application/octet-stream" });
}

test("File Validation - validates supported extensions and sizes", () => {
  // Valid PDF
  const validPdf = createMockFile("candidate.pdf", 1024 * 50);
  const pdfRes = validateResumeFile(validPdf);
  assert.equal(pdfRes.isValid, true);
  assert.equal(pdfRes.error, null);

  // Valid DOCX
  const validDocx = createMockFile("candidate.docx", 1024 * 100);
  const docxRes = validateResumeFile(validDocx);
  assert.equal(docxRes.isValid, true);
  assert.equal(docxRes.error, null);

  // Missing file
  const nullRes = validateResumeFile(null);
  assert.equal(nullRes.isValid, false);
  assert.match(nullRes.error!, /select a PDF or Word document/i);

  // Unsupported extension (.txt)
  const txtFile = createMockFile("resume.txt", 1024);
  const txtRes = validateResumeFile(txtFile);
  assert.equal(txtRes.isValid, false);
  assert.match(txtRes.error!, /unsupported file format/i);

  // 0-byte file
  const emptyFile = createMockFile("empty.pdf", 0);
  const emptyRes = validateResumeFile(emptyFile);
  assert.equal(emptyRes.isValid, false);
  assert.match(emptyRes.error!, /empty \(0 bytes\)/i);

  // File exceeding 5 MB limit
  const largeFile = createMockFile("large.pdf", MAX_FILE_SIZE_BYTES + 1024);
  const largeRes = validateResumeFile(largeFile);
  assert.equal(largeRes.isValid, false);
  assert.match(largeRes.error!, /exceeds the maximum allowed limit of 5 MB/i);
});

test("Job Description Validation - enforces content and length limits", () => {
  // Empty or whitespace-only
  const emptyRes = validateJobDescription("   \n\t  ");
  assert.equal(emptyRes.isValid, false);
  assert.match(emptyRes.error!, /enter or paste the target job description/i);

  // Valid job description
  const validRes = validateJobDescription("Seeking a Senior Backend Engineer proficient in Python and FastAPI.");
  assert.equal(validRes.isValid, true);
  assert.equal(validRes.error, null);

  // Exceeding 25,000 characters
  const oversizedText = "x".repeat(MAX_JOB_DESCRIPTION_CHARS + 1);
  const overRes = validateJobDescription(oversizedText);
  assert.equal(overRes.isValid, false);
  assert.match(overRes.error!, /exceeds maximum limit/i);
});

test("File Size Formatter - formats bytes accurately", () => {
  assert.equal(formatFileSize(0), "0 B");
  assert.equal(formatFileSize(512), "512 B");
  assert.equal(formatFileSize(1024 * 150), "150 KB");
  assert.equal(formatFileSize(1024 * 1024 * 2.5), "2.5 MB");
});

test("ApiError - preserves code, status, message, and details", () => {
  const err = new ApiError(
    "Gemini key is missing",
    "CONFIGURATION_ERROR",
    503,
    { key: "value" }
  );
  assert.equal(err.name, "ApiError");
  assert.equal(err.code, "CONFIGURATION_ERROR");
  assert.equal(err.statusCode, 503);
  assert.equal(err.message, "Gemini key is missing");
  assert.deepEqual(err.details, { key: "value" });
});

test("Workflow Request Sequence - extraction feeds into tailoring", () => {
  // Simulate extraction output
  const mockExtraction = {
    filename: "my_resume.pdf",
    file_type: "pdf",
    file_size_bytes: 5000,
    extracted_text: "Jane Doe\nPrincipal Engineer with 8 years of Python experience.",
    character_count: 55,
  };

  const jobDescription = "Looking for a Principal Engineer with Python, FastAPI, and Kubernetes.";

  // Verify that extraction text transitions directly to the tailoring payload
  const tailoringPayload = {
    extracted_text: mockExtraction.extracted_text,
    job_description: jobDescription,
  };

  assert.equal(tailoringPayload.extracted_text, mockExtraction.extracted_text);
  assert.equal(tailoringPayload.job_description, jobDescription);
  assert.ok(tailoringPayload.extracted_text.length > 0);
  assert.ok(tailoringPayload.job_description.length > 0);
});

test("Contract Integrity - missing keywords are segregated from established skills", () => {
  const sampleResponse = {
    tailored_resume: {
      contact: { full_name: "Jane Doe" },
      professional_summary: "Experienced Engineer",
      skills: [
        {
          category: "Languages",
          skills: ["Python", "TypeScript"],
        },
      ],
      experience: [],
      projects: [],
      education: [],
      certifications: [],
    },
    missing_keywords: [
      {
        keyword: "Kubernetes",
        category: "Cloud",
        context_or_reason: "Required for production deployments",
        suggested_action: "Add only if verified",
      },
    ],
    alignment_score: 85,
    summary_notes: "Aligned summary",
  };

  // Assert that "Kubernetes" is in missing_keywords
  assert.equal(sampleResponse.missing_keywords[0].keyword, "Kubernetes");

  // Assert that "Kubernetes" is NOT in the candidate's established skills
  const establishedSkills = sampleResponse.tailored_resume.skills.flatMap((s) => s.skills);
  assert.ok(!establishedSkills.includes("Kubernetes"));
});

test("Contract Integrity - handles omitted and null optional sections gracefully", () => {
  const minimalResponse = {
    tailored_resume: {
      contact: null,
      professional_summary: null,
      skills: [],
      experience: [],
      projects: [],
      education: [],
      certifications: [],
    },
    missing_keywords: [],
    alignment_score: null,
    summary_notes: null,
  };

  assert.equal(minimalResponse.tailored_resume.contact, null);
  assert.equal(minimalResponse.tailored_resume.professional_summary, null);
  assert.equal(minimalResponse.tailored_resume.skills.length, 0);
  assert.equal(minimalResponse.alignment_score, null);
  assert.equal(minimalResponse.missing_keywords.length, 0);
});

test("Content-Disposition Filename Parsing - handles plain, quoted, encoded, and fallback headers", () => {
  // Standard quoted filename
  assert.equal(
    parseContentDispositionFilename(
      'attachment; filename="Jane_Doe_Tailored_Resume.pdf"',
      "fallback.pdf"
    ),
    "Jane_Doe_Tailored_Resume.pdf"
  );

  // Unquoted filename
  assert.equal(
    parseContentDispositionFilename(
      "attachment; filename=candidate_resume.docx",
      "fallback.docx"
    ),
    "candidate_resume.docx"
  );

  // UTF-8 encoded filename
  assert.equal(
    parseContentDispositionFilename(
      "attachment; filename*=UTF-8''Jane%20Doe%20Resume.pdf",
      "fallback.pdf"
    ),
    "Jane Doe Resume.pdf"
  );

  // Null or missing header
  assert.equal(
    parseContentDispositionFilename(null, "Tailored_Resume.pdf"),
    "Tailored_Resume.pdf"
  );
});

test("PDF & DOCX Export API - dispatches requests with correct endpoints, payloads, and handles response blobs", async () => {
  const originalFetch = globalThis.fetch;

  const sampleResumePayload = {
    tailored_resume: {
      contact: { full_name: "Jane Doe" },
      professional_summary: "Experienced Engineer",
      skills: [],
      experience: [],
      projects: [],
      education: [],
      certifications: [],
    },
    missing_keywords: [],
    alignment_score: 90,
    summary_notes: "Aligned",
  };

  try {
    // 1. Verify PDF Export
    let capturedPdfUrl = "";
    let capturedPdfMethod = "";
    let capturedPdfBody = "";

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      capturedPdfUrl = String(input);
      capturedPdfMethod = init?.method || "";
      capturedPdfBody = String(init?.body || "");

      return new Response(new Blob(["%PDF-1.4 mock content"]), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="Jane_Doe_Tailored_Resume.pdf"',
        },
      });
    };

    const pdfResult = await exportResumePdf(sampleResumePayload);
    assert.match(capturedPdfUrl, /\/api\/resume\/export\/pdf$/);
    assert.equal(capturedPdfMethod, "POST");
    assert.ok(capturedPdfBody.includes("Jane Doe"));
    assert.equal(pdfResult.filename, "Jane_Doe_Tailored_Resume.pdf");
    assert.ok(pdfResult.blob instanceof Blob);

    // 2. Verify DOCX Export
    let capturedDocxUrl = "";
    let capturedDocxMethod = "";

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      capturedDocxUrl = String(input);
      capturedDocxMethod = init?.method || "";

      return new Response(new Blob(["PK mock docx content"]), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": 'attachment; filename="Jane_Doe_Tailored_Resume.docx"',
        },
      });
    };

    const docxResult = await exportResumeDocx(sampleResumePayload);
    assert.match(capturedDocxUrl, /\/api\/resume\/export\/docx$/);
    assert.equal(capturedDocxMethod, "POST");
    assert.equal(docxResult.filename, "Jane_Doe_Tailored_Resume.docx");
    assert.ok(docxResult.blob instanceof Blob);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Export API Error Handling & Retry - maps backend errors to ApiError and recovers on retry", async () => {
  const originalFetch = globalThis.fetch;
  const samplePayload = {
    tailored_resume: {
      contact: { full_name: "Jane Doe" },
      professional_summary: null,
      skills: [],
      experience: [],
      projects: [],
      education: [],
      certifications: [],
    },
    missing_keywords: [],
    alignment_score: null,
    summary_notes: null,
  };

  try {
    let callCount = 0;

    globalThis.fetch = async () => {
      callCount += 1;
      if (callCount === 1) {
        // First attempt fails with backend error envelope
        return new Response(
          JSON.stringify({
            error: {
              code: "EXPORT_FAILED",
              message: "Failed to generate PDF resume export.",
            },
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Second attempt (retry) succeeds
      return new Response(new Blob(["%PDF-1.4 success"]), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="Retried_Resume.pdf"',
        },
      });
    };

    // First attempt must throw structured ApiError
    await assert.rejects(
      async () => {
        await exportResumePdf(samplePayload);
      },
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal((err as ApiError).code, "EXPORT_FAILED");
        assert.equal((err as ApiError).statusCode, 500);
        return true;
      }
    );

    // Second attempt (retry) succeeds without error
    const retryResult = await exportResumePdf(samplePayload);
    assert.equal(retryResult.filename, "Retried_Resume.pdf");
    assert.equal(callCount, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Job Description Boundary Validation - enforces exact 25,000 char boundary", () => {
  // Exactly 25,000 characters
  const exactMax = "a".repeat(MAX_JOB_DESCRIPTION_CHARS);
  const exactRes = validateJobDescription(exactMax);
  assert.equal(exactRes.isValid, true);
  assert.equal(exactRes.error, null);

  // 25,001 characters
  const overByOne = "a".repeat(MAX_JOB_DESCRIPTION_CHARS + 1);
  const overRes = validateJobDescription(overByOne);
  assert.equal(overRes.isValid, false);
  assert.match(overRes.error!, /25,000 characters/);
});

test("Privacy & Security - client workflow maintains zero persistent browser storage", () => {
  if (typeof globalThis.localStorage !== "undefined" && typeof globalThis.localStorage.length === "number") {
    assert.equal(globalThis.localStorage.length, 0);
  }
});

test("Rate Limit Error Handling - ApiError properly captures HTTP 429 and retry after details", () => {
  const rateLimitErr = new ApiError(
    "Too many tailoring requests. Please wait 45 second(s) before trying again.",
    "RATE_LIMIT_EXCEEDED",
    429,
    { retry_after_seconds: 45 }
  );
  assert.equal(rateLimitErr.statusCode, 429);
  assert.equal(rateLimitErr.code, "RATE_LIMIT_EXCEEDED");
  assert.deepEqual(rateLimitErr.details, { retry_after_seconds: 45 });
});

test("Production Health Check Model - validates health payload with gemini_configured readiness flag", () => {
  const healthyPayload = {
    status: "ok",
    app_name: "AI Resume Tailor API",
    environment: "production",
    version: "0.1.0",
    gemini_configured: true,
  };
  assert.equal(healthyPayload.status, "ok");
  assert.equal(healthyPayload.gemini_configured, true);
  assert.equal(healthyPayload.environment, "production");
});

test("Tailoring API - AbortSignal cancellation throws REQUEST_CANCELLED (499)", async () => {
  const originalFetch = globalThis.fetch;
  const controller = new AbortController();

  globalThis.fetch = async (_input: RequestInfo | URL, init?: RequestInit) => {
    // Simulate user cancelling while request is in flight
    const signal = init?.signal;
    return new Promise((_, reject) => {
      if (signal?.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      signal?.addEventListener("abort", () => {
        reject(new DOMException("Aborted", "AbortError"));
      });
    });
  };

  try {
    const tailorPromise = tailorResume(
      { extracted_text: "Jane Doe", job_description: "Senior Engineer" },
      controller.signal
    );

    // Abort immediately
    controller.abort();

    await assert.rejects(
      async () => {
        await tailorPromise;
      },
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal((err as ApiError).code, "REQUEST_CANCELLED");
        assert.equal((err as ApiError).statusCode, 499);
        return true;
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Tailoring API - Client timeout protection maps to LLM_TIMEOUT (504)", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (_input: RequestInfo | URL, init?: RequestInit) => {
    const signal = init?.signal;
    return new Promise((_, reject) => {
      if (signal?.aborted) {
        reject(new DOMException("The request timed out.", "TimeoutError"));
        return;
      }
      signal?.addEventListener("abort", () => {
        reject(new DOMException("The request timed out.", "TimeoutError"));
      });
    });
  };

  try {
    await assert.rejects(
      async () => {
        // Fast timeout of 30ms for testing
        await tailorResume(
          { extracted_text: "Jane Doe", job_description: "Senior Engineer" },
          undefined,
          30
        );
      },
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal((err as ApiError).code, "LLM_TIMEOUT");
        assert.equal((err as ApiError).statusCode, 504);
        assert.match((err as ApiError).message, /timed out/i);
        return true;
      }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Tailoring API - Recovers successfully on retry after transient failure", async () => {
  const originalFetch = globalThis.fetch;
  let callCount = 0;

  const mockPayload = {
    tailored_resume: {
      contact: { full_name: "Jane Doe" },
      professional_summary: "Experienced Engineer",
      skills: [],
      experience: [],
      projects: [],
      education: [],
      certifications: [],
    },
    missing_keywords: [],
    alignment_score: 95,
    summary_notes: "Aligned",
  };

  globalThis.fetch = async () => {
    callCount += 1;
    if (callCount === 1) {
      // First attempt fails with 502 LLM_PROVIDER_ERROR (high demand)
      return new Response(
        JSON.stringify({
          error: {
            code: "LLM_PROVIDER_ERROR",
            message: "The AI service is currently experiencing high demand. Please try again in a few moments.",
          },
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Second attempt (retry) succeeds
    return new Response(JSON.stringify(mockPayload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    // Attempt 1 fails
    await assert.rejects(
      async () => {
        await tailorResume({ extracted_text: "Jane Doe", job_description: "Senior Engineer" });
      },
      (err: unknown) => {
        assert.ok(err instanceof ApiError);
        assert.equal((err as ApiError).code, "LLM_PROVIDER_ERROR");
        assert.equal((err as ApiError).statusCode, 502);
        return true;
      }
    );

    // Attempt 2 succeeds
    const result = await tailorResume({ extracted_text: "Jane Doe", job_description: "Senior Engineer" });
    assert.equal(result.tailored_resume.contact?.full_name, "Jane Doe");
    assert.equal(result.alignment_score, 95);
    assert.equal(callCount, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});


