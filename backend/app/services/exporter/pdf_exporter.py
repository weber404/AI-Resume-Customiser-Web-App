import io
import xml.sax.saxutils as saxutils
from typing import List, Optional, Union

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

from app.schemas.resume import ResumeData, TailoredResumeResponse


def _escape(text: Optional[str]) -> str:
    """Clean typographic characters and escape XML entities for ReportLab Paragraphs."""
    if not text:
        return ""
    cleaned = (
        text.replace("\u2018", "'")
        .replace("\u2019", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u2013", "-")
        .replace("\u2014", "--")
        .replace("\u2026", "...")
        .replace("\u00a0", " ")
    )
    return saxutils.escape(cleaned)


def _build_pdf_styles():
    """Create curated, ATS-friendly typographic styles."""
    styles = getSampleStyleSheet()

    # Base colors
    primary_color = colors.HexColor("#0f172a")  # Slate 900
    subtle_color = colors.HexColor("#475569")   # Slate 600
    accent_color = colors.HexColor("#0369a1")   # Sky 700

    name_style = ParagraphStyle(
        "ResumeName",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        alignment=1,  # Centered
        textColor=primary_color,
        spaceAfter=3,
    )

    contact_style = ParagraphStyle(
        "ResumeContact",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11.5,
        alignment=1,  # Centered
        textColor=subtle_color,
        spaceAfter=10,
    )

    section_heading = ParagraphStyle(
        "ResumeSectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=13.5,
        textColor=accent_color,
        spaceBefore=7,
        spaceAfter=2,
        keepWithNext=True,
    )

    item_title_style = ParagraphStyle(
        "ResumeItemTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=12.5,
        textColor=primary_color,
        spaceBefore=4,
        spaceAfter=1,
        keepWithNext=True,
    )

    item_subtitle_style = ParagraphStyle(
        "ResumeItemSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8.5,
        leading=11.5,
        textColor=subtle_color,
        spaceAfter=2,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        "ResumeBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12.5,
        textColor=primary_color,
        spaceAfter=4,
    )

    bullet_style = ParagraphStyle(
        "ResumeBullet",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11.5,
        textColor=primary_color,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=2,
    )

    skill_line_style = ParagraphStyle(
        "ResumeSkillLine",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12.5,
        textColor=primary_color,
        spaceAfter=2.5,
    )

    tech_stack_style = ParagraphStyle(
        "ResumeTechStack",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10.5,
        textColor=subtle_color,
        leftIndent=12,
        spaceAfter=3,
    )

    return {
        "name": name_style,
        "contact": contact_style,
        "heading": section_heading,
        "item_title": item_title_style,
        "item_subtitle": item_subtitle_style,
        "body": body_style,
        "bullet": bullet_style,
        "skill": skill_line_style,
        "tech": tech_stack_style,
    }


def _add_section_heading(title: str, styles: dict) -> List:
    """Generate section heading with underline rule and keepWithNext semantics."""
    p = Paragraph(title.upper(), styles["heading"])
    hr = HRFlowable(
        width="100%",
        thickness=0.5,
        color=colors.HexColor("#0284c7"),
        spaceAfter=4,
        spaceBefore=1,
    )
    return [p, hr]


def generate_resume_pdf(data: Union[TailoredResumeResponse, ResumeData]) -> bytes:
    """Build a professional, single-column ATS-friendly PDF resume in memory."""
    if isinstance(data, TailoredResumeResponse):
        resume = data.tailored_resume
    else:
        resume = data

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = _build_pdf_styles()
    story = []

    # 1. Contact Info Header
    if resume.contact:
        c = resume.contact
        if c.full_name:
            story.append(Paragraph(_escape(c.full_name), styles["name"]))

        contact_parts = []
        if c.location:
            contact_parts.append(_escape(c.location))
        if c.email:
            contact_parts.append(_escape(c.email))
        if c.phone:
            contact_parts.append(_escape(c.phone))
        if c.linkedin_url:
            contact_parts.append(_escape(c.linkedin_url))
        if c.github_url:
            contact_parts.append(_escape(c.github_url))
        if c.portfolio_url:
            contact_parts.append(_escape(c.portfolio_url))

        if contact_parts:
            contact_line = " &bull; ".join(contact_parts)
            story.append(Paragraph(contact_line, styles["contact"]))
        else:
            story.append(Spacer(1, 6))
    else:
        story.append(Spacer(1, 4))

    # 2. Professional Summary
    if resume.professional_summary and resume.professional_summary.strip():
        story.extend(_add_section_heading("Professional Summary", styles))
        story.append(Paragraph(_escape(resume.professional_summary.strip()), styles["body"]))
        story.append(Spacer(1, 2))

    # 3. Skills
    if resume.skills and any(cat.skills for cat in resume.skills):
        story.extend(_add_section_heading("Skills", styles))
        for cat in resume.skills:
            if cat.skills:
                skills_str = ", ".join(cat.skills)
                line = f"<b>{_escape(cat.category)}:</b> {_escape(skills_str)}"
                story.append(Paragraph(line, styles["skill"]))
        story.append(Spacer(1, 2))

    # 4. Work Experience
    if resume.experience:
        story.extend(_add_section_heading("Work Experience", styles))
        for exp in resume.experience:
            # Header line: Title | Company
            title_text = f"<b>{_escape(exp.title)}</b> &mdash; {_escape(exp.company)}"
            story.append(Paragraph(title_text, styles["item_title"]))

            # Date and Location line
            date_range = exp.start_date
            if exp.is_current or not exp.end_date:
                date_range += " - Present"
            elif exp.end_date:
                date_range += f" - {exp.end_date}"

            sub_parts = [date_range]
            if exp.location:
                sub_parts.append(exp.location)
            sub_line = " | ".join([_escape(part) for part in sub_parts])
            story.append(Paragraph(sub_line, styles["item_subtitle"]))

            # Bullet points
            for bullet in exp.bullet_points:
                if bullet.strip():
                    story.append(Paragraph(f"&bull;&nbsp;&nbsp;{_escape(bullet.strip())}", styles["bullet"]))

            # Technologies
            if exp.technologies_used:
                tech_text = f"<i>Key Technologies:</i> {_escape(', '.join(exp.technologies_used))}"
                story.append(Paragraph(tech_text, styles["tech"]))

        story.append(Spacer(1, 2))

    # 5. Projects
    if resume.projects:
        story.extend(_add_section_heading("Projects", styles))
        for proj in resume.projects:
            title_text = f"<b>{_escape(proj.title)}</b>"
            if proj.url:
                title_text += f" &bull; <i>{_escape(proj.url)}</i>"
            story.append(Paragraph(title_text, styles["item_title"]))

            if proj.description and proj.description.strip():
                story.append(Paragraph(_escape(proj.description.strip()), styles["body"]))

            for bullet in proj.bullet_points:
                if bullet.strip():
                    story.append(Paragraph(f"&bull;&nbsp;&nbsp;{_escape(bullet.strip())}", styles["bullet"]))

            if proj.technologies_used:
                tech_text = f"<i>Technologies:</i> {_escape(', '.join(proj.technologies_used))}"
                story.append(Paragraph(tech_text, styles["tech"]))

        story.append(Spacer(1, 2))

    # 6. Education
    if resume.education:
        story.extend(_add_section_heading("Education", styles))
        for edu in resume.education:
            degree_text = f"<b>{_escape(edu.degree)}"
            if edu.field_of_study:
                degree_text += f" in {_escape(edu.field_of_study)}"
            degree_text += f"</b> &mdash; {_escape(edu.institution)}"
            story.append(Paragraph(degree_text, styles["item_title"]))

            sub_parts = []
            if edu.start_date or edu.end_date:
                d_str = ""
                if edu.start_date:
                    d_str += f"{edu.start_date} - "
                d_str += edu.end_date or "Present"
                sub_parts.append(d_str)
            if edu.gpa:
                sub_parts.append(f"GPA: {edu.gpa}")
            if sub_parts:
                story.append(Paragraph(" | ".join([_escape(p) for p in sub_parts]), styles["item_subtitle"]))

            for highlight in edu.highlights:
                if highlight.strip():
                    story.append(Paragraph(f"&bull;&nbsp;&nbsp;{_escape(highlight.strip())}", styles["bullet"]))

        story.append(Spacer(1, 2))

    # 7. Certifications
    if resume.certifications:
        story.extend(_add_section_heading("Certifications", styles))
        for cert in resume.certifications:
            cert_text = f"<b>{_escape(cert.name)}</b> &mdash; {_escape(cert.issuer)}"
            if cert.issue_date:
                cert_text += f" ({_escape(cert.issue_date)})"
            story.append(Paragraph(cert_text, styles["item_title"]))
            if cert.credential_id or cert.url:
                details = []
                if cert.credential_id:
                    details.append(f"ID: {_escape(cert.credential_id)}")
                if cert.url:
                    details.append(_escape(cert.url))
                story.append(Paragraph(" | ".join(details), styles["item_subtitle"]))

    # If completely empty resume, supply minimal placeholder flowable
    if not story:
        story.append(Paragraph("Resume content not available.", styles["body"]))

    doc.build(story)
    return buffer.getvalue()
