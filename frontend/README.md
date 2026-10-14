# AI Resume Tailor — Frontend

Next.js 16 App Router interface for AI Resume Tailor, built with TypeScript and Tailwind CSS.

## Key Features & Accessibility (Phase 6)

- **Accessible Keyboard & Screen Reader Navigation:** Skip link to main content (`#main-content`), programmatic focus shifting upon validation failure, and `aria-live` polite/assertive status announcements for document extraction, tailoring, and error states.
- **Visual & Focus Indicators:** Global `*:focus-visible` high-contrast indicator (`#38bdf8`), semantic headings, landmarks (`<header>`, `<main>`, `<footer>`), and accessible labels.
- **Workflow Reliability:** Client-side validation for file types (`.pdf`, `.docx`), 5 MB file size limit, and 25,000 character job description boundaries, with authoritative backend validation.
- **In-Memory & Ephemeral:** Zero persistent storage (`localStorage`, `sessionStorage`, or cookies) used for resume or job description content.
- **Document Export:** ATS-compliant PDF and DOCX export triggers with error resilience and retry capabilities.

## Getting Started

```bash
# Install dependencies
npm install

# Start local development server (http://localhost:3000)
npm run dev

# Run unit and contract tests (12 tests)
npm test

# Run ESLint
npm run lint

# Compile production bundle
npm run build
```

