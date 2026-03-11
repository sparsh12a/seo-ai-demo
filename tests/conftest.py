from __future__ import annotations

import pytest

from seo_agent.models import Article, ArticleSection


def make_article(sections: list[dict], word_count: int | None = None) -> Article:
    """Build an Article from a list of dicts with keys: heading, level, content."""
    article_sections = [ArticleSection(**s) for s in sections]
    parts = [f"{'#' * s.level} {s.heading}\n\n{s.content}" for s in article_sections]
    full_markdown = "\n\n".join(parts)
    actual_word_count = word_count if word_count is not None else len(full_markdown.split())
    return Article(
        sections=article_sections,
        full_markdown=full_markdown,
        word_count=actual_word_count,
    )
