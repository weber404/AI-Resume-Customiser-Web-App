/**
 * Candidate contact information.
 */
export interface ContactInfo {
  full_name: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  github_url?: string | null;
}

/**
 * Categorized skills set.
 */
export interface SkillCategory {
  category: string;
  skills: string[];
}

/**
 * Professional work experience entry.
 */
export interface ExperienceItem {
  title: string;
  company: string;
  location?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current?: boolean;
  bullet_points: string[];
  technologies_used?: string[];
}

/**
 * Key project entry.
 */
export interface ProjectItem {
  title: string;
  description?: string | null;
  url?: string | null;
  bullet_points: string[];
  technologies_used?: string[];
}

/**
 * Educational qualification entry.
 */
export interface EducationItem {
  institution: string;
  degree: string;
  field_of_study?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  gpa?: string | null;
  highlights?: string[];
}

/**
 * Professional certification entry.
 */
export interface CertificationItem {
  name: string;
  issuer: string;
  issue_date?: string | null;
  expiration_date?: string | null;
  credential_id?: string | null;
  url?: string | null;
}

/**
 * Missing keyword suggestion identifying job requirement gaps.
 */
export interface MissingKeywordSuggestion {
  keyword: string;
  category: string;
  context_or_reason: string;
  suggested_action?: string | null;
}

/**
 * Structured resume representation.
 */
export interface ResumeData {
  contact?: ContactInfo | null;
  professional_summary?: string | null;
  skills: SkillCategory[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
}

/**
 * Response payload returned upon successful resume file ingestion and text extraction.
 */
export interface ResumeExtractionResponse {
  filename: string;
  file_type: "pdf" | "docx";
  file_size_bytes: number;
  extracted_text: string;
  character_count: number;
}

/**
 * Complete tailored resume payload response.
 */
export interface TailoredResumeResponse {
  tailored_resume: ResumeData;
  missing_keywords: MissingKeywordSuggestion[];
  alignment_score?: number | null;
  summary_notes?: string | null;
}

/**
 * Request payload for tailoring a resume against a target job description.
 */
export interface TailorResumeRequest {
  extracted_text: string;
  job_description: string;
}
