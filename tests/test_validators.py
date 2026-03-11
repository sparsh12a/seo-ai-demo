from __future__ import annotations

import pytest

from seo_agent.validators import (
    has_h1,
    keyword_in_intro,
    keyword_in_title,
    min_heading_count,
    word_count_in_range,
)
from tests.conftest import make_article


# --- has_h1 ---

def test_has_h1_true():
    article = make_article([
        {"heading": "Best Tools", "level": 1, "content": "Intro content here."},
        {"heading": "Section One", "level": 2, "content": "More content."},
    ])
    assert has_h1(article) is True


def test_has_h1_false():
    article = make_article([
        {"heading": "Section One", "level": 2, "content": "Content here."},
        {"heading": "Section Two", "level": 2, "content": "More content."},
    ])
    assert has_h1(article) is False


# --- keyword_in_title ---

def test_keyword_in_title_true():
    article = make_article([
        {"heading": "Best Productivity Tools for Remote Teams", "level": 1, "content": "Intro."},
    ])
    assert keyword_in_title(article, "productivity tools") is True


def test_keyword_in_title_false():
    article = make_article([
        {"heading": "Getting Things Done Effectively", "level": 1, "content": "Intro."},
    ])
    assert keyword_in_title(article, "productivity tools") is False


def test_keyword_in_title_case_insensitive():
    article = make_article([
        {"heading": "PRODUCTIVITY TOOLS for Every Team", "level": 1, "content": "Intro."},
    ])
    assert keyword_in_title(article, "productivity tools") is True


def test_keyword_in_title_no_h1():
    article = make_article([
        {"heading": "Section with productivity tools", "level": 2, "content": "Content."},
    ])
    assert keyword_in_title(article, "productivity tools") is False


# --- keyword_in_intro ---

def test_keyword_in_intro_true():
    article = make_article([
        {"heading": "Title", "level": 1, "content": "This guide covers productivity tools for remote teams."},
    ])
    assert keyword_in_intro(article, "productivity tools") is True


def test_keyword_in_intro_false():
    article = make_article([
        {"heading": "Title", "level": 1, "content": "This guide covers collaboration and teamwork."},
    ])
    assert keyword_in_intro(article, "productivity tools") is False


def test_keyword_in_intro_empty_article():
    article = make_article([])
    assert keyword_in_intro(article, "productivity tools") is False


# --- word_count_in_range ---

def test_word_count_in_range_true():
    # Target 1000, word_count=1000 — exactly in range
    article = make_article([{"heading": "H", "level": 1, "content": "x"}], word_count=1000)
    assert word_count_in_range(article, 1000) is True


def test_word_count_in_range_false_low():
    # Target 1000, lower bound = 800; word_count=799 → below range
    article = make_article([{"heading": "H", "level": 1, "content": "x"}], word_count=799)
    assert word_count_in_range(article, 1000) is False


def test_word_count_in_range_false_high():
    # Target 1000, upper bound = 1200; word_count=1201 → above range
    article = make_article([{"heading": "H", "level": 1, "content": "x"}], word_count=1201)
    assert word_count_in_range(article, 1000) is False


def test_word_count_tolerance_edge():
    # Exactly at lower bound (800 for target=1000) → True
    article = make_article([{"heading": "H", "level": 1, "content": "x"}], word_count=800)
    assert word_count_in_range(article, 1000) is True


# --- min_heading_count ---

def test_min_heading_count_true():
    sections = [
        {"heading": f"Section {i}", "level": 2, "content": "Content."}
        for i in range(5)
    ]
    article = make_article(sections)
    assert min_heading_count(article) is True


def test_min_heading_count_false():
    sections = [
        {"heading": f"Section {i}", "level": 2, "content": "Content."}
        for i in range(4)
    ]
    article = make_article(sections)
    assert min_heading_count(article) is False


def test_min_heading_count_custom_minimum():
    sections = [
        {"heading": f"Section {i}", "level": 2, "content": "Content."}
        for i in range(3)
    ]
    article = make_article(sections)
    assert min_heading_count(article, minimum=3) is True
    assert min_heading_count(article, minimum=4) is False
