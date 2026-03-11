from __future__ import annotations

from . import db
from .exceptions import SEOGenerationError, SEOSERPError, SEOValidationError
from .generator import (
    enrich_seo,
    extract_keywords,
    generate_article,
    generate_faq_answers,
    generate_outline,
    humanize_article,
)
from .models import ArticleOutput, JobStatus
from .scorer import score_article
from .serp import fetch_serp


def run_job(job_id: str) -> ArticleOutput:
    job = db.get_job(job_id)
    if job is None:
        raise ValueError(f"Job {job_id} not found")

    db.update_status(job_id, JobStatus.running)

    try:
        # Step 1: SERP (with crash recovery)
        if job.serp_data:
            serp_results, faqs = db.get_serp_data(job_id)
        else:
            try:
                serp_results, faqs = fetch_serp(job.keyword)
            except Exception as exc:
                raise SEOSERPError(f"[fetch_serp] {type(exc).__name__}: {exc}") from exc
            db.set_serp_data(job_id, serp_results, faqs)

        # Step 2: Keyword extraction
        try:
            keyword_analysis = extract_keywords(job.keyword, serp_results)
        except Exception as exc:
            raise SEOGenerationError(f"[extract_keywords] {type(exc).__name__}: {exc}") from exc

        # Step 3: Outline
        try:
            outline = generate_outline(keyword_analysis, serp_results)
        except Exception as exc:
            raise SEOGenerationError(f"[generate_outline] {type(exc).__name__}: {exc}") from exc

        # Step 3b: FAQ answer generation (fill in unanswered FAQs before article)
        if faqs:
            try:
                faqs = generate_faq_answers(faqs, keyword_analysis)
            except Exception as exc:
                raise SEOGenerationError(
                    f"[generate_faq_answers] {type(exc).__name__}: {exc}"
                ) from exc

        # Steps 4, 4b, 4c: Article → Humanize → Score with revision loop
        QUALITY_THRESHOLD = 0.6
        MAX_REVISION_ATTEMPTS = 3

        best_article, best_quality_report = None, None
        revision_notes = ""

        for attempt in range(MAX_REVISION_ATTEMPTS):
            try:
                article = generate_article(
                    outline,
                    keyword_analysis,
                    job.target_word_count,
                    job.language,
                    faqs=faqs,
                    revision_notes=revision_notes,
                )
            except Exception as exc:
                raise SEOGenerationError(
                    f"[generate_article] {type(exc).__name__}: {exc}"
                ) from exc

            try:
                article = humanize_article(article, outline)
            except Exception as exc:
                raise SEOGenerationError(
                    f"[humanize_section] {type(exc).__name__}: {exc}"
                ) from exc

            try:
                quality_report = score_article(article, keyword_analysis, job.target_word_count)
            except Exception as exc:
                raise SEOValidationError(
                    f"[score_article] {type(exc).__name__}: {exc}"
                ) from exc

            if best_quality_report is None or quality_report.overall_score > best_quality_report.overall_score:
                best_article, best_quality_report = article, quality_report

            if quality_report.overall_score >= QUALITY_THRESHOLD:
                break

            revision_notes = quality_report.feedback

        article, quality_report = best_article, best_quality_report
        revision_attempts = attempt + 1

        # Step 5: SEO enrichment
        try:
            seo_metadata, internal_links, external_references = enrich_seo(
                article, keyword_analysis
            )
        except Exception as exc:
            raise SEOGenerationError(f"[enrich_seo] {type(exc).__name__}: {exc}") from exc

        # Step 6: Assemble output
        output = ArticleOutput(
            job_id=job_id,
            keyword_analysis=keyword_analysis,
            article=article,
            seo_metadata=seo_metadata,
            internal_links=internal_links,
            external_references=external_references,
            quality_report=quality_report,
            revision_attempts=revision_attempts,
        )

        db.set_output(job_id, output)
        db.update_status(job_id, JobStatus.completed)
        return output

    except Exception as exc:
        db.update_status(job_id, JobStatus.failed, error_message=str(exc))
        raise
