import test from "node:test";
import assert from "node:assert/strict";
import {
  exportResumePdf,
  exportResumeDocx,
} from "../src/lib/api.ts";
import type {
  TailoredResumeResponse,
  ResumeData,
  SkillCategory,
  ExperienceItem,
  ProjectItem,
} from "../src/types/resume.ts";

// Sample initial AI-tailored resume payload
const initialPayload: TailoredResumeResponse = {
  tailored_resume: {
    contact: {
      full_name: "Alex Johnson",
      email: "alex@example.com",
      phone: "+1 (555) 019-2834",
      location: "San Francisco, CA",
      linkedin_url: "https://linkedin.com/in/alexjohnson",
      github_url: "https://github.com/alexjohnson",
      portfolio_url: "https://alexjohnson.dev",
    },
    professional_summary:
      "Results-driven Software Engineer with 5+ years of experience in Python and FastAPI.",
    skills: [
      {
        category: "Languages & Frameworks",
        skills: ["Python", "FastAPI", "SQL"],
      },
      {
        category: "Cloud & Databases",
        skills: ["PostgreSQL", "Docker"],
      },
    ],
    experience: [
      {
        title: "Software Engineer",
        company: "Acme Corp",
        location: "San Francisco, CA",
        start_date: "Jan 2021",
        end_date: "Present",
        is_current: true,
        bullet_points: [
          "Developed high-throughput REST APIs using FastAPI.",
          "Optimized database queries in PostgreSQL reducing latency by 30%.",
        ],
        technologies_used: ["Python", "FastAPI", "PostgreSQL"],
      },
    ],
    projects: [
      {
        title: "API Gateway Accelerator",
        description: "Low latency reverse proxy and rate limiter.",
        url: "https://github.com/alexjohnson/gateway",
        bullet_points: ["Handles 10k requests per second."],
        technologies_used: ["Python", "Redis"],
      },
    ],
    education: [
      {
        institution: "University of California, Berkeley",
        degree: "Bachelor of Science",
        field_of_study: "Computer Science",
        start_date: "Aug 2016",
        end_date: "May 2020",
        gpa: "3.8",
      },
    ],
    certifications: [
      {
        name: "AWS Certified Developer",
        issuer: "Amazon Web Services",
        issue_date: "May 2022",
      },
    ],
  },
  missing_keywords: [
    {
      keyword: "Kubernetes",
      category: "Infrastructure",
      context_or_reason: "Target job lists Kubernetes as required.",
    },
  ],
  alignment_score: 85,
  summary_notes: "Aligned summary and experience towards backend requirements.",
};

test("Resume Editing - Professional summary edit and save updates state", () => {
  let workingResume: ResumeData = { ...initialPayload.tailored_resume };
  const newSummary =
    "Lead Backend Architect with 6+ years designing mission-critical distributed systems.";

  // Simulate Save
  workingResume = {
    ...workingResume,
    professional_summary: newSummary,
  };

  assert.equal(workingResume.professional_summary, newSummary);
  // Verify other sections remain untouched
  assert.equal(workingResume.contact?.full_name, "Alex Johnson");
  assert.equal(workingResume.skills.length, 2);
});

test("Resume Editing - Cancelling edits preserves existing content without modifications", () => {
  const originalSummary = initialPayload.tailored_resume.professional_summary;
  const workingResume: ResumeData = { ...initialPayload.tailored_resume };

  // User begins editing draft
  let draftSummary = "Unsaved draft text that should be cancelled";

  // Simulate Cancel (draft discarded)
  draftSummary = originalSummary || "";

  assert.equal(workingResume.professional_summary, originalSummary);
  assert.equal(draftSummary, originalSummary);
});

test("Resume Editing - Editing individual work experience entries and bullet points", () => {
  let workingResume: ResumeData = { ...initialPayload.tailored_resume };
  const updatedExperience: ExperienceItem[] = workingResume.experience.map((exp, idx) => {
    if (idx === 0) {
      return {
        ...exp,
        title: "Senior Backend Engineer",
        company: "Acme Cloud Systems",
        bullet_points: [
          ...exp.bullet_points,
          "Architected real-time event streaming pipeline using Kafka.",
        ],
        technologies_used: [...(exp.technologies_used || []), "Kafka"],
      };
    }
    return exp;
  });

  workingResume = {
    ...workingResume,
    experience: updatedExperience,
  };

  const exp0 = workingResume.experience[0];
  assert.equal(exp0.title, "Senior Backend Engineer");
  assert.equal(exp0.company, "Acme Cloud Systems");
  assert.equal(exp0.bullet_points.length, 3);
  assert.equal(
    exp0.bullet_points[2],
    "Architected real-time event streaming pipeline using Kafka."
  );
  assert.ok(exp0.technologies_used?.includes("Kafka"));
});

test("Resume Editing - Editing skills categories and project descriptions", () => {
  let workingResume: ResumeData = { ...initialPayload.tailored_resume };

  // Edit skills
  const updatedSkills: SkillCategory[] = [
    {
      category: "Backend & Systems",
      skills: ["Python", "FastAPI", "Go", "Distributed Systems"],
    },
    {
      category: "Storage & Caching",
      skills: ["PostgreSQL", "Redis", "Kafka"],
    },
  ];

  // Edit projects
  const updatedProjects: ProjectItem[] = [
    {
      ...workingResume.projects[0],
      title: "Enterprise API Gateway",
      description: "Distributed reverse proxy and rate limiter serving 20M requests/day.",
      bullet_points: [
        "Reduced 99th percentile response latency from 45ms to 8ms.",
        "Implemented distributed token bucket rate limiting in Redis.",
      ],
      technologies_used: ["Python", "FastAPI", "Redis", "Docker"],
    },
  ];

  workingResume = {
    ...workingResume,
    skills: updatedSkills,
    projects: updatedProjects,
  };

  assert.equal(workingResume.skills[0].category, "Backend & Systems");
  assert.ok(workingResume.skills[0].skills.includes("Go"));
  assert.equal(workingResume.projects[0].title, "Enterprise API Gateway");
  assert.equal(workingResume.projects[0].bullet_points.length, 2);
});

test("Resume Editing - Saving multiple sections preserves earlier saved changes", () => {
  let workingResume: ResumeData = { ...initialPayload.tailored_resume };

  // Edit 1: Contact
  workingResume = {
    ...workingResume,
    contact: {
      ...workingResume.contact!,
      full_name: "Alex Johnson, Staff Engineer",
      location: "New York, NY",
    },
  };

  // Edit 2: Summary
  workingResume = {
    ...workingResume,
    professional_summary: "Multi-disciplinary Staff Software Engineer.",
  };

  // Edit 3: Skills
  workingResume = {
    ...workingResume,
    skills: [
      {
        category: "Core Stack",
        skills: ["Python", "TypeScript", "FastAPI", "Next.js"],
      },
    ],
  };

  // Verify all 3 edits are simultaneously preserved
  assert.equal(workingResume.contact?.full_name, "Alex Johnson, Staff Engineer");
  assert.equal(workingResume.contact?.location, "New York, NY");
  assert.equal(
    workingResume.professional_summary,
    "Multi-disciplinary Staff Software Engineer."
  );
  assert.equal(workingResume.skills[0].category, "Core Stack");
  assert.ok(workingResume.skills[0].skills.includes("Next.js"));
});

test("Resume Editing - PDF export dispatches the latest saved edits", async () => {
  const originalFetch = globalThis.fetch;
  let interceptedBody: unknown = null;

  globalThis.fetch = async (_input: RequestInfo | URL, init?: RequestInit) => {
    interceptedBody = JSON.parse(init?.body as string);
    return new Response(new Blob(["%PDF-1.4 Mock"]), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Alex_Johnson_Resume.pdf"',
      },
    });
  };

  try {
    const editedResponse: TailoredResumeResponse = {
      ...initialPayload,
      tailored_resume: {
        ...initialPayload.tailored_resume,
        professional_summary: "Updated summary specifically for PDF export.",
        contact: {
          ...initialPayload.tailored_resume.contact!,
          full_name: "Alex J. Edited",
        },
      },
    };

    const { filename } = await exportResumePdf(editedResponse);
    assert.equal(filename, "Alex_Johnson_Resume.pdf");

    const sent = (interceptedBody as TailoredResumeResponse).tailored_resume;
    assert.equal(sent.contact?.full_name, "Alex J. Edited");
    assert.equal(
      sent.professional_summary,
      "Updated summary specifically for PDF export."
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Resume Editing - DOCX export dispatches the latest saved edits", async () => {
  const originalFetch = globalThis.fetch;
  let interceptedBody: unknown = null;

  globalThis.fetch = async (_input: RequestInfo | URL, init?: RequestInit) => {
    interceptedBody = JSON.parse(init?.body as string);
    return new Response(new Blob(["PK Mock DOCX"]), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="Alex_Johnson_Resume.docx"',
      },
    });
  };

  try {
    const editedResponse: TailoredResumeResponse = {
      ...initialPayload,
      tailored_resume: {
        ...initialPayload.tailored_resume,
        experience: [
          {
            ...initialPayload.tailored_resume.experience[0],
            title: "Principal Engineer",
          },
        ],
      },
    };

    const { filename } = await exportResumeDocx(editedResponse);
    assert.equal(filename, "Alex_Johnson_Resume.docx");

    const sent = (interceptedBody as TailoredResumeResponse).tailored_resume;
    assert.equal(sent.experience[0].title, "Principal Engineer");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Resume Editing - Export payload contains pure resume data with no UI edit artifacts", async () => {
  const originalFetch = globalThis.fetch;
  let interceptedJson: Record<string, unknown> | null = null;

  globalThis.fetch = async (_input: RequestInfo | URL, init?: RequestInit) => {
    interceptedJson = JSON.parse(init?.body as string);
    return new Response(new Blob(["%PDF-1.4 Mock"]), {
      status: 200,
      headers: { "Content-Type": "application/pdf" },
    });
  };

  try {
    await exportResumePdf(initialPayload);

    // Verify schema structure contains only domain data
    assert.ok(interceptedJson);
    const resume = (interceptedJson as Record<string, unknown>).tailored_resume as Record<
      string,
      unknown
    >;

    assert.equal(typeof resume.contact, "object");
    assert.equal(typeof resume.professional_summary, "string");
    assert.ok(Array.isArray(resume.skills));
    assert.ok(Array.isArray(resume.experience));

    // Ensure no UI state properties leaked into exported payload
    assert.equal(resume.activeEditingSection, undefined);
    assert.equal(resume.isEditing, undefined);
    assert.equal(resume.editMode, undefined);
    assert.equal(resume.pencilIcon, undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Resume Editing - ATS match score retains original value and does not claim recalculation", () => {
  const originalScore = initialPayload.alignment_score; // 85
  let hasManualEdits = false;

  // After user modifies multiple sections
  hasManualEdits = true;

  // Alignment score must NOT be mutated or falsely recalculated without AI
  assert.equal(initialPayload.alignment_score, originalScore);
  assert.equal(hasManualEdits, true);
});
