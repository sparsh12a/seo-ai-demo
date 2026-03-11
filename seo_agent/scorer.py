from __future__ import annotations

from .models import Article, KeywordAnalysis, QualityReport
from .validators import (
    has_h1,
    keyword_in_intro,
    keyword_in_title,
    min_heading_count,
    word_count_in_range,
)

_WEIGHTS = {
    "keyword_in_title": 0.25,
    "keyword_in_intro": 0.20,
    "has_h1": 0.20,
    "word_count_in_range": 0.20,
    "min_heading_count": 0.15,
}


def score_article(
    article: Article, keyword_analysis: KeywordAnalysis, target_word_count: int
) -> QualityReport:
    keyword = keyword_analysis.primary_keyword
    checks = {
        "keyword_in_title": keyword_in_title(article, keyword),
        "keyword_in_intro": keyword_in_intro(article, keyword),
        "has_h1": has_h1(article),
        "word_count_in_range": word_count_in_range(article, target_word_count),
        "min_heading_count": min_heading_count(article),
    }
    overall_score = sum(_WEIGHTS[k] for k, passed in checks.items() if passed)
    failed = [k for k, passed in checks.items() if not passed]
    feedback = ", ".join(failed)
    return QualityReport(overall_score=overall_score, checks=checks, feedback=feedback)
