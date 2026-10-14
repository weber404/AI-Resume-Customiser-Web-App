import os
from fastapi.testclient import TestClient
import fitz  # PyMuPDF
import docx
import io

from app.main import app
from app.services.exporter.filename import generate_safe_filename

client = TestClient(app)

SAMPLE_RESUME_PAYLOAD = {
    "tailored_resume": {
        "contact": {
            "full_name": "Jane Doe",
            "email": "jane.doe@example.com",
            "phone": "+1 (555) 234-5678",
            "location": "San Francisco, CA",
            "linkedin_url": "https://linkedin.com/in/janedoe",
            "portfolio_url": "https://janedoe.dev",
            "github_url": "https://github.com/janedoe",
        },
        "professional_summary": (
            "Senior Backend Engineer with 8+ years of expertise in distributed systems, "
            "Python, FastAPI, and scalable microservice architectures. Proven track record "
            "of cutting API latencies by 45% and leading engineering teams."
        ),
        "skills": [
            {
                "category": "Languages & Frameworks",
                "skills": ["Python", "FastAPI", "Go", "TypeScript", "SQL"],
            },
            {
                "category": "Cloud & Infrastructure",
                "skills": ["AWS", "Docker", "Kubernetes", "Terraform", "PostgreSQL"],
            },
        ],
        "experience": [
            {
                "title": "Staff Backend Engineer",
                "company": "Acme Cloud Corp",
                "location": "San Francisco, CA",
                "start_date": "Jan 2021",
                "end_date": "Present",
                "is_current": True,
                "bullet_points": [
                    "Spearheaded distributed event-driven pipeline processing 25M daily transactions.",
                    "Designed high-performance REST APIs with FastAPI, reducing P99 latency by 45%.",
                    "Mentored 6 engineers across architecture reviews and clean code standards.",
                ],
                "technologies_used": ["Python", "FastAPI", "Kafka", "AWS"],
            },
            {
                "title": "Senior Software Engineer",
                "company": "Beta Analytics Inc",
                "location": "San Jose, CA",
                "start_date": "Mar 2018",
                "end_date": "Dec 2020",
                "is_current": False,
                "bullet_points": [
                    "Modernized legacy monolithic backend into Python microservices.",
                    "Integrated comprehensive observability with Prometheus and OpenTelemetry.",
                ],
                "technologies_used": ["Python", "Docker", "PostgreSQL"],
            },
        ],
        "projects": [
            {
                "title": "Distributed Task Scheduler",
                "description": "High-throughput async job orchestrator with leader election.",
                "url": "https://github.com/janedoe/scheduler",
                "bullet_points": [
                    "Engineered heartbeat mechanism with Raft consensus algorithm.",
                ],
                "technologies_used": ["Python", "Redis", "AsyncIO"],
            }
        ],
        "education": [
            {
                "institution": "University of California, Berkeley",
                "degree": "Bachelor of Science",
                "field_of_study": "Computer Science",
                "start_date": "2014",
                "end_date": "2018",
                "gpa": "3.85",
                "highlights": ["Dean's Honors List", "Teaching Assistant for CS61A"],
            }
        ],
        "certifications": [
            {
                "name": "AWS Certified Solutions Architect - Professional",
                "issuer": "Amazon Web Services",
                "issue_date": "2023",
                "credential_id": "AWS-PSA-98765",
                "url": "https://aws.amazon.com/verification",
            }
        ],
    },
    "missing_keywords": [],
    "alignment_score": 92,
    "summary_notes": "Emphasized FastAPI and distributed systems architecture.",
}


def test_filename_generator_sanitizes_safely():
    """Verify safe filename generation across various candidate name inputs."""
    assert generate_safe_filename("Jane Doe", "pdf") == "Jane_Doe_Tailored_Resume.pdf"
    assert generate_safe_filename("John O'Connor", "docx") == "John_O_Connor_Tailored_Resume.docx"
    assert generate_safe_filename("../../etc/passwd", "pdf") == "etc_passwd_Tailored_Resume.pdf"
    assert generate_safe_filename("   ", "pdf") == "Tailored_Resume.pdf"
    assert generate_safe_filename(None, "docx") == "Tailored_Resume.docx"


def test_export_pdf_success_headers_and_content():
    """Verify PDF export returns HTTP 200, proper headers, and readable PDF binary."""
    files_before = set(os.listdir("."))
    response = client.post("/api/resume/export/pdf", json=SAMPLE_RESUME_PAYLOAD)

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert 'attachment; filename="Jane_Doe_Tailored_Resume.pdf"' in response.headers["content-disposition"]
    assert int(response.headers["content-length"]) > 1000

    # Verify content using PyMuPDF (fitz)
    pdf_doc = fitz.open(stream=response.content, filetype="pdf")
    assert pdf_doc.page_count >= 1
    extracted_text = "".join([page.get_text() for page in pdf_doc])

    assert "Jane Doe" in extracted_text
    assert "Acme Cloud Corp" in extracted_text
    assert "Distributed Task Scheduler" in extracted_text
    assert "University of California, Berkeley" in extracted_text
    assert "AWS Certified Solutions Architect" in extracted_text

    # Verify no persistent files were created on disk
    files_after = set(os.listdir("."))
    assert files_before == files_after


def test_export_docx_success_headers_and_content():
    """Verify DOCX export returns HTTP 200, proper headers, and valid docx binary."""
    files_before = set(os.listdir("."))
    response = client.post("/api/resume/export/docx", json=SAMPLE_RESUME_PAYLOAD)

    assert response.status_code == 200
    assert (
        response.headers["content-type"]
        == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    assert 'attachment; filename="Jane_Doe_Tailored_Resume.docx"' in response.headers["content-disposition"]
    assert int(response.headers["content-length"]) > 1000

    # Verify content using python-docx
    doc = docx.Document(io.BytesIO(response.content))
    paragraphs_text = " ".join([p.text for p in doc.paragraphs])

    assert "Jane Doe" in paragraphs_text
    assert "Acme Cloud Corp" in paragraphs_text
    assert "Distributed Task Scheduler" in paragraphs_text
    assert "University of California, Berkeley" in paragraphs_text
    assert "AWS Certified Solutions Architect" in paragraphs_text

    # Verify no persistent files were created on disk
    files_after = set(os.listdir("."))
    assert files_before == files_after


def test_export_pdf_and_docx_with_empty_and_optional_sections():
    """Verify export endpoints handle omitted, null, or empty sections gracefully."""
    minimal_payload = {
        "tailored_resume": {
            "contact": None,
            "professional_summary": None,
            "skills": [],
            "experience": [],
            "projects": [],
            "education": [],
            "certifications": [],
        },
        "missing_keywords": [],
        "alignment_score": None,
        "summary_notes": None,
    }

    # Test PDF with empty resume
    res_pdf = client.post("/api/resume/export/pdf", json=minimal_payload)
    assert res_pdf.status_code == 200
    assert res_pdf.headers["content-type"] == "application/pdf"
    assert 'attachment; filename="Tailored_Resume.pdf"' in res_pdf.headers["content-disposition"]

    # Test DOCX with empty resume
    res_docx = client.post("/api/resume/export/docx", json=minimal_payload)
    assert res_docx.status_code == 200
    assert (
        res_docx.headers["content-type"]
        == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    assert 'attachment; filename="Tailored_Resume.docx"' in res_docx.headers["content-disposition"]


def test_export_missing_tailored_resume_field_returns_validation_error():
    """Verify that requests missing the required tailored_resume field return 400."""
    res_pdf = client.post("/api/resume/export/pdf", json={})
    assert res_pdf.status_code == 400
    assert res_pdf.json()["error"]["code"] == "VALIDATION_ERROR"

    res_docx = client.post("/api/resume/export/docx", json={})
    assert res_docx.status_code == 400
    assert res_docx.json()["error"]["code"] == "VALIDATION_ERROR"


def test_export_multi_page_long_content():
    """Verify that extensive content spans multiple pages cleanly without clipping."""
    # Generate 15 distinct experiences and 10 projects
    long_payload = {
        "tailored_resume": {
            "contact": {
                "full_name": "Multi Page Candidate",
                "email": "candidate@example.com",
            },
            "professional_summary": "Extensive executive career summary spanning two decades.",
            "skills": [
                {
                    "category": f"Skill Category {i}",
                    "skills": [f"Skill {i}.A", f"Skill {i}.B", f"Skill {i}.C"],
                }
                for i in range(10)
            ],
            "experience": [
                {
                    "title": f"Engineering Leader Role {i}",
                    "company": f"Enterprise Tech Co {i}",
                    "location": "Remote",
                    "start_date": f"20{10+i:02d}",
                    "end_date": f"20{11+i:02d}",
                    "bullet_points": [
                        f"Delivered high-value business milestone {j} driving 35% revenue growth."
                        for j in range(5)
                    ],
                    "technologies_used": ["Python", "Docker", "AWS"],
                }
                for i in range(8)
            ],
            "projects": [
                {
                    "title": f"Large Scale System {i}",
                    "description": f"Architected high throughput enterprise microservice {i}.",
                    "bullet_points": [f"Key accomplishment {j} for project {i}" for j in range(3)],
                    "technologies_used": ["FastAPI", "PostgreSQL"],
                }
                for i in range(5)
            ],
            "education": [
                {
                    "institution": "State University",
                    "degree": "Master of Science",
                    "field_of_study": "Software Engineering",
                    "start_date": "2008",
                    "end_date": "2010",
                }
            ],
            "certifications": [],
        }
    }

    # Verify PDF multi-page generation
    res_pdf = client.post("/api/resume/export/pdf", json=long_payload)
    assert res_pdf.status_code == 200
    pdf_doc = fitz.open(stream=res_pdf.content, filetype="pdf")
    # Extensive content should produce multiple pages
    assert pdf_doc.page_count >= 2
    full_pdf_text = "".join([p.get_text() for p in pdf_doc])
    assert "Engineering Leader Role 7" in full_pdf_text
    assert "Large Scale System 4" in full_pdf_text

    # Verify DOCX multi-page generation
    res_docx = client.post("/api/resume/export/docx", json=long_payload)
    assert res_docx.status_code == 200
    doc = docx.Document(io.BytesIO(res_docx.content))
    docx_text = " ".join([p.text for p in doc.paragraphs])
    assert "Engineering Leader Role 7" in docx_text
    assert "Large Scale System 4" in docx_text


def test_export_invalid_payload_returns_sanitized_validation_error():
    """Verify that invalid payloads return standard error envelope with no stack traces."""
    # Invalid data types
    invalid_payload = {"tailored_resume": "this-should-be-an-object"}

    res = client.post("/api/resume/export/pdf", json=invalid_payload)
    assert res.status_code in [400, 422]
    data = res.json()
    assert "error" in data
    assert "message" in data["error"]
    # Ensure no python traceback leaked
    assert "Traceback" not in str(data)
    assert "Exception" not in str(data)


def test_export_pdf_and_docx_contains_latest_manual_edits():
    """Verify that manually edited resume sections appear in both PDF and DOCX exports, with zero edit artifacts."""
    edited_payload = {
        "tailored_resume": {
            "contact": {
                "full_name": "Jane Doe, Principal Architect",
                "email": "jane.doe@architect.dev",
                "location": "Seattle, WA",
            },
            "professional_summary": (
                "Specialized distributed systems architect with 12+ years leading "
                "event-driven infrastructure, high-throughput microservices, and Rust."
            ),
            "skills": [
                {
                    "category": "Cloud & Languages",
                    "skills": ["Rust", "Python", "FastAPI", "Kafka", "AWS"],
                }
            ],
            "experience": [
                {
                    "title": "Principal Solutions Architect",
                    "company": "NextGen Cloud Labs",
                    "location": "Seattle, WA",
                    "start_date": "Jan 2022",
                    "end_date": "Present",
                    "is_current": True,
                    "bullet_points": [
                        "Architected zero-copy event broker cutting latency by 60%.",
                        "Led team of 15 senior and staff engineers across cloud migrations.",
                    ],
                    "technologies_used": ["Rust", "Kafka", "AWS"],
                }
            ],
            "projects": [
                {
                    "title": "NextGen Stream Engine",
                    "description": "High throughput real-time analytical pipeline.",
                    "bullet_points": ["Achieved 500k events/sec throughput with sub-millisecond p99."],
                    "technologies_used": ["Rust", "FastAPI"],
                }
            ],
            "education": [
                {
                    "institution": "University of Washington",
                    "degree": "M.S. in Computer Science",
                    "start_date": "2018",
                    "end_date": "2020",
                }
            ],
            "certifications": [
                {
                    "name": "AWS Certified Solutions Architect - Professional",
                    "issuer": "Amazon Web Services",
                }
            ],
        },
        "missing_keywords": [],
        "alignment_score": 92,
    }

    # 1. Verify PDF export contains latest manual edits
    pdf_res = client.post("/api/resume/export/pdf", json=edited_payload)
    assert pdf_res.status_code == 200
    pdf_doc = fitz.open(stream=pdf_res.content, filetype="pdf")
    pdf_text = "".join([p.get_text() for p in pdf_doc])

    assert "Jane Doe, Principal Architect" in pdf_text
    assert "Specialized distributed systems architect" in pdf_text
    assert "Rust" in pdf_text
    assert "Principal Solutions Architect" in pdf_text
    assert "NextGen Cloud Labs" in pdf_text
    assert "NextGen Stream Engine" in pdf_text
    assert "University of Washington" in pdf_text
    assert "AWS Certified Solutions Architect - Professional" in pdf_text

    # Verify zero edit UI controls / buttons in exported PDF
    assert "Edit" not in pdf_text
    assert "Save changes" not in pdf_text
    assert "Cancel editing" not in pdf_text
    assert "✏" not in pdf_text

    # 2. Verify DOCX export contains latest manual edits
    docx_res = client.post("/api/resume/export/docx", json=edited_payload)
    assert docx_res.status_code == 200
    docx_doc = docx.Document(io.BytesIO(docx_res.content))
    docx_text = " ".join([p.text for p in docx_doc.paragraphs])
    # Also check tables in docx
    for t in docx_doc.tables:
        for row in t.rows:
            for cell in row.cells:
                docx_text += " " + cell.text

    assert "Jane Doe, Principal Architect" in docx_text
    assert "Specialized distributed systems architect" in docx_text
    assert "Rust" in docx_text
    assert "Principal Solutions Architect" in docx_text
    assert "NextGen Cloud Labs" in docx_text
    assert "NextGen Stream Engine" in docx_text
    assert "University of Washington" in docx_text
    assert "AWS Certified Solutions Architect - Professional" in docx_text

    # Verify zero edit UI controls / buttons in exported DOCX
    assert "Save changes" not in docx_text
    assert "Cancel editing" not in docx_text
    assert "✏" not in docx_text

