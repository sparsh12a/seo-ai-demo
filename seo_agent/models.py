from __future__ import annotations

import enum
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class JobStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class Job(BaseModel):
    id: UUID
    status: JobStatus
    keyword: str
    target_word_count: int
    language: str
    serp_data: Optional[str] = None       # JSON string
    output_json: Optional[str] = None     # JSON string
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None


class SERPResult(BaseModel):
    rank: int
    url: str
    title: str
    snippet: str


class KeywordAnalysis(BaseModel):
    primary_keyword: str
    secondary_keywords: list[str] = Field(..., min_length=6, max_length=10)


class OutlineItem(BaseModel):
    heading: str
    level: int = Field(..., ge=1, le=3)
    description: str
    target_keywords: list[str] = Field(default_factory=list)


class ArticleSection(BaseModel):
    heading: str
    level: int = Field(..., ge=1, le=3)
    content: str


class FAQ(BaseModel):
    question: str
    answer: str


class QualityReport(BaseModel):
    overall_score: float
    checks: dict[str, bool]
    feedback: str


class Article(BaseModel):
    sections: list[ArticleSection]
    full_markdown: str
    word_count: int
    faqs: list[FAQ] = Field(default_factory=list)


class SEOMetadata(BaseModel):
    title_tag: str
    meta_description: str


class LinkingSuggestion(BaseModel):
    anchor_text: str
    suggested_target: str
    context_note: str


class ExternalReference(BaseModel):
    source_name: str
    url: str
    placement_context: str


class ArticleOutput(BaseModel):
    job_id: str
    keyword_analysis: KeywordAnalysis
    article: Article
    seo_metadata: SEOMetadata
    internal_links: list[LinkingSuggestion] = Field(..., min_length=3, max_length=5)
    external_references: list[ExternalReference] = Field(..., min_length=2, max_length=4)
    quality_report: Optional[QualityReport] = None
    revision_attempts: int = 1
