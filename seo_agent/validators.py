from __future__ import annotations

from .models import Article


def has_h1(article: Article) -> bool:
    return any(s.level == 1 for s in article.sections)


def keyword_in_title(article: Article, keyword: str) -> bool:
    for s in article.sections:
        if s.level == 1:
            return keyword.lower() in s.heading.lower()
    return False


def keyword_in_intro(article: Article, keyword: str) -> bool:
    if not article.sections:
        return False
    return keyword.lower() in article.sections[0].content.lower()


def word_count_in_range(article: Article, target: int, tolerance: float = 0.2) -> bool:
    lower = target * (1 - tolerance)
    upper = target * (1 + tolerance)
    return lower <= article.word_count <= upper


def min_heading_count(article: Article, minimum: int = 5) -> bool:
    return len(article.sections) >= minimum
