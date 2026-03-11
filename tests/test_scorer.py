from __future__ import annotations

import pytest

from seo_agent.models import KeywordAnalysis
from seo_agent.scorer import score_article
from tests.conftest import make_article

KEYWORD = "productivity tools"
KW_ANALYSIS = KeywordAnalysis(
    primary_keyword=KEYWORD,
    secondary_keywords=["remote work", "task manager", "time tracking", "workflow", "collaboration", "efficiency"],
)
TARGET = 1000


def _perfect_article():
    """Article that passes all 5 checks for target=1000."""
    sections = [
        {
            "heading": f"Best {KEYWORD} for Remote Work",
            "level": 1,
            "content": f"Discover the best {KEYWORD} available today.",
        },
        {"heading": "Section 2", "level": 2, "content": "Content for section 2."},
        {"heading": "Section 3", "level": 2, "content": "Content for section 3."},
        {"heading": "Section 4", "level": 2, "content": "Content for section 4."},
        {"heading": "Section 5", "level": 2, "content": "Content for section 5."},
    ]
    return make_article(sections, word_count=1000)


def test_perfect_score():
    article = _perfect_article()
    report = score_article(article, KW_ANALYSIS, TARGET)
    assert report.overall_score == pytest.approx(1.0)
    assert report.feedback == ""


def test_zero_score():
    # No H1, keyword absent everywhere, word count way off, only 1 section
    article = make_article(
        [{"heading": "Some Section", "level": 2, "content": "Unrelated content about cooking."}],
        word_count=50,
    )
    report = score_article(article, KW_ANALYSIS, TARGET)
    assert report.overall_score == pytest.approx(0.0)
    for key in ["has_h1", "keyword_in_title", "keyword_in_intro", "word_count_in_range", "min_heading_count"]:
        assert key in report.feedback


def test_partial_score_title_and_h1():
    # keyword_in_title (0.25) + has_h1 (0.20) pass = 0.45
    # keyword_in_intro fails (content lacks keyword), word_count off, < 5 sections
    sections = [
        {
            "heading": f"Guide to {KEYWORD}",
            "level": 1,
            "content": "Unrelated intro content without the target phrase.",
        },
    ]
    article = make_article(sections, word_count=50)
    report = score_article(article, KW_ANALYSIS, TARGET)
    assert report.overall_score == pytest.approx(0.45)
    assert report.checks["keyword_in_title"] is True
    assert report.checks["has_h1"] is True
    assert report.checks["keyword_in_intro"] is False
    assert report.checks["word_count_in_range"] is False
    assert report.checks["min_heading_count"] is False


def test_checks_dict_keys():
    article = _perfect_article()
    report = score_article(article, KW_ANALYSIS, TARGET)
    expected_keys = {"has_h1", "keyword_in_title", "keyword_in_intro", "word_count_in_range", "min_heading_count"}
    assert set(report.checks.keys()) == expected_keys


def test_feedback_lists_only_failures():
    # keyword_in_title passes (0.25), everything else fails
    sections = [
        {
            "heading": f"Guide to {KEYWORD}",
            "level": 1,
            "content": "Unrelated content here.",
        },
    ]
    article = make_article(sections, word_count=50)
    report = score_article(article, KW_ANALYSIS, TARGET)
    failed = [k for k, v in report.checks.items() if not v]
    for name in failed:
        assert name in report.feedback
    # keyword_in_title passed → must NOT be in feedback
    assert "keyword_in_title" not in report.feedback


def test_score_at_threshold():
    # Pass has_h1 (0.20) + keyword_in_intro (0.20) + word_count_in_range (0.20) = 0.60
    # Fail: keyword_in_title (no keyword in H1 heading), min_heading_count (only 1 section)
    sections = [
        {
            "heading": "A Generic Title Without The Phrase",
            "level": 1,
            "content": f"This intro covers {KEYWORD} in detail.",
        },
    ]
    article = make_article(sections, word_count=1000)
    report = score_article(article, KW_ANALYSIS, TARGET)
    assert report.overall_score == pytest.approx(0.60)
