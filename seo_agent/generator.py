from __future__ import annotations

import json
import os
import re

import anthropic

from .context import anthropic_key as _ctx_anthropic_key
from .models import (
    FAQ,
    Article,
    ArticleSection,
    ExternalReference,
    KeywordAnalysis,
    LinkingSuggestion,
    OutlineItem,
    SEOMetadata,
    SERPResult,
)

_client: anthropic.Anthropic | None = None


def _get_client() -> anthropic.Anthropic:
    global _client
    key = _ctx_anthropic_key.get()
    if key:
        return anthropic.Anthropic(api_key=key)
    if _client is None:
        _client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    return _client


def _call_claude(model: str, system: str, user: str) -> dict:
    response = _get_client().messages.create(
        model=model,
        max_tokens=4096,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    text = response.content[0].text.strip()
    # Strip code fences if present
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return json.loads(text.strip())


def extract_keywords(keyword: str, serp_results: list[SERPResult]) -> KeywordAnalysis:
    serp_text = "\n".join(
        f"{r.rank}. {r.title}: {r.snippet}" for r in serp_results
    )
    system = (
        "You are an SEO keyword research expert. "
        "Respond ONLY with a valid JSON object, no explanation."
    )
    user = f"""Analyze the following SERP results for the keyword "{keyword}" and extract secondary keywords.

SERP Results:
{serp_text}

Return a JSON object with this exact structure:
{{
  "primary_keyword": "{keyword}",
  "secondary_keywords": ["kw1", "kw2", ...]
}}

Requirements:
- secondary_keywords must contain 6 to 10 items
- Mine keywords from titles and snippets
- Include long-tail variations, related terms, and semantic keywords
- Do NOT include the primary keyword itself in secondary_keywords"""

    data = _call_claude("claude-haiku-4-5-20251001", system, user)
    return KeywordAnalysis(**data)


def generate_outline(
    keyword_analysis: KeywordAnalysis, serp_results: list[SERPResult]
) -> list[OutlineItem]:
    serp_text = "\n".join(
        f"{r.rank}. {r.title}" for r in serp_results
    )
    secondary = ", ".join(keyword_analysis.secondary_keywords)
    system = (
        "You are an expert content strategist. "
        "Respond ONLY with a valid JSON array, no explanation."
    )
    user = f"""Create a comprehensive article outline for the keyword: "{keyword_analysis.primary_keyword}"

Secondary keywords to incorporate: {secondary}

Top-ranking article titles for reference:
{serp_text}

Return a JSON array of heading objects ordered as they should appear in the article:
[
  {{
    "heading": "...",
    "level": 1,
    "description": "2-3 sentence brief of what this section should cover",
    "target_keywords": ["keyword1"]
  }},
  ...
]

Requirements:
- Exactly one level-1 heading (the article title), must contain the primary keyword
- 4-8 level-2 headings (main sections)
- 2-4 level-3 subheadings where appropriate
- Each heading must have a description (2-3 sentences) explaining what the section should cover
- target_keywords: assign 1-2 secondary keywords most relevant to that section; distribute keywords across sections, do not repeat the same keyword in multiple sections
- Headings should naturally incorporate secondary keywords
- Structure should beat competing content comprehensively"""

    data = _call_claude("claude-sonnet-4-6", system, user)
    return [OutlineItem(**item) for item in data]


def _generate_section(
    item: OutlineItem,
    primary_keyword: str,
    is_first: bool,
    word_count: int,
    language: str,
    revision_notes: str = "",
) -> ArticleSection:
    kw_instruction = (
        f"You MUST use the following keyword(s) verbatim at least once in the content: "
        f"{', '.join(item.target_keywords)}."
        if item.target_keywords
        else ""
    )
    first_instruction = (
        f"This is the opening section. The primary keyword \"{primary_keyword}\" must appear "
        f"in the first paragraph."
        if is_first
        else ""
    )
    system = (
        "You are a professional SEO content writer. "
        "Respond ONLY with a valid JSON object, no explanation."
    )
    user = f"""Write the content for one article section.

Heading: {item.heading}
Heading level: {item.level}
Section brief: {item.description}
Target language: {language}
Word count for this section: {word_count} words (hard limit — do not exceed by more than 10%)
{kw_instruction}
{first_instruction}

Return a JSON object:
{{
  "heading": "{item.heading}",
  "level": {item.level},
  "content": "full section content in markdown (do NOT include the heading itself)"
}}

Requirements:
- Content must directly fulfil the section brief
- Do not repeat the heading text inside the content
- Write in a clear, engaging, professional tone
- Vary sentence length; avoid generic filler phrases
- Never use em-dashes (--) in the content; use commas, colons, or parentheses instead
{f"REVISION NOTE: A previous attempt failed these quality checks: {revision_notes}. Ensure the primary keyword appears in the heading (if this is H1) and in the first paragraph (if this is the first section)." if revision_notes else ""}"""

    data = _call_claude("claude-sonnet-4-6", system, user)
    return ArticleSection(**data)


def generate_faq_answers(faqs: list[FAQ], keyword_analysis: KeywordAnalysis) -> list[FAQ]:
    unanswered = [f for f in faqs if not f.answer]
    if not unanswered:
        return faqs

    questions_text = "\n".join(
        f"{i + 1}. {f.question}" for i, f in enumerate(unanswered)
    )
    system = (
        "You are an SEO content expert. "
        "Respond ONLY with a valid JSON array, no explanation."
    )
    user = f"""Answer the following questions about "{keyword_analysis.primary_keyword}".
Each answer should be 1-3 concise sentences suitable for a FAQ section.

Questions:
{questions_text}

Return a JSON array of objects in the same order:
[
  {{"question": "...", "answer": "..."}},
  ...
]"""

    data = _call_claude("claude-haiku-4-5-20251001", system, user)
    answered = {item["question"]: item["answer"] for item in data}

    result = []
    for faq in faqs:
        if not faq.answer and faq.question in answered:
            result.append(FAQ(question=faq.question, answer=answered[faq.question]))
        else:
            result.append(faq)
    return result


def _budget_per_section(outline: list[OutlineItem], total: int) -> dict[int, int]:
    """Distribute total word budget across all sections proportionally.

    Weights: H1 = 0.5 unit, H2 = 1 unit, H3 = 0.4 unit.
    This ensures the sum of per-section targets equals `total`.
    """
    weights = {1: 0.5, 2: 1.0, 3: 0.4}
    total_units = sum(weights.get(item.level, 1.0) for item in outline)
    words_per_unit = total / total_units if total_units else total
    return {
        i: max(40, round(words_per_unit * weights.get(item.level, 1.0)))
        for i, item in enumerate(outline)
    }


def generate_article(
    outline: list[OutlineItem],
    keyword_analysis: KeywordAnalysis,
    word_count: int,
    language: str,
    faqs: list[FAQ] = [],
    revision_notes: str = "",
) -> Article:
    budget = _budget_per_section(outline, word_count)

    sections: list[ArticleSection] = []
    for i, item in enumerate(outline):
        per_section = budget[i]
        section = _generate_section(
            item=item,
            primary_keyword=keyword_analysis.primary_keyword,
            is_first=(i == 0),
            word_count=per_section,
            language=language,
            revision_notes=revision_notes,
        )
        sections.append(section)

    # Assemble full markdown
    parts = [f"{'#' * s.level} {s.heading}\n\n{s.content}" for s in sections]
    full_markdown = "\n\n".join(parts)

    # Append FAQ section if provided
    if faqs:
        faq_lines = ["## Frequently Asked Questions", ""]
        for faq in faqs:
            faq_lines.append(f"**Q: {faq.question}**")
            faq_lines.append(f"A: {faq.answer}")
            faq_lines.append("")
        full_markdown = full_markdown + "\n\n" + "\n".join(faq_lines).strip()

    actual_word_count = len(full_markdown.split())

    return Article(
        sections=sections,
        full_markdown=full_markdown,
        word_count=actual_word_count,
        faqs=faqs,
    )


def _call_claude_text(model: str, system: str, user: str) -> str:
    """Like _call_claude but returns raw text instead of parsed JSON."""
    response = _get_client().messages.create(
        model=model,
        max_tokens=4096,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    return response.content[0].text.strip()


def humanize_section(section: ArticleSection, target_keywords: list[str]) -> ArticleSection:
    kw_note = (
        f"You MUST keep these keyword(s) present verbatim in your rewrite: "
        f"{', '.join(target_keywords)}. Do not remove or paraphrase them."
        if target_keywords
        else ""
    )
    system = (
        "You are an editor who rewrites AI-generated content to sound natural and human. "
        "Return ONLY the rewritten content, no commentary."
    )
    user = f"""Rewrite the following article section to sound more human and natural.

{kw_note}

Rules:
- Vary sentence length — mix short punchy sentences with longer ones
- Add contractions where natural (it's, you'll, don't, etc.)
- Never use em-dashes; use commas, colons, or parentheses instead
- Remove generic AI phrases like "In today's fast-paced world", "It's worth noting", "Delve into", "In conclusion", "Furthermore"
- Add one opinionated or direct observation per section where it fits naturally
- Keep all factual information and structure intact
- Do NOT add or remove headings
- Return only the rewritten body content (no heading)

Original content:
{section.content}"""

    new_content = _call_claude_text("claude-haiku-4-5-20251001", system, user)
    return ArticleSection(heading=section.heading, level=section.level, content=new_content)


def humanize_article(article: Article, outline: list[OutlineItem]) -> Article:
    # Build a map from heading -> target_keywords for quick lookup
    kw_map: dict[str, list[str]] = {item.heading: item.target_keywords for item in outline}

    humanized_sections: list[ArticleSection] = []
    for section in article.sections:
        target_keywords = kw_map.get(section.heading, [])
        humanized_sections.append(humanize_section(section, target_keywords))

    parts = [f"{'#' * s.level} {s.heading}\n\n{s.content}" for s in humanized_sections]
    full_markdown = "\n\n".join(parts)

    # Re-append FAQ section if the original article had FAQs
    faqs = article.faqs
    if faqs:
        faq_lines = ["## Frequently Asked Questions", ""]
        for faq in faqs:
            faq_lines.append(f"**Q: {faq.question}**")
            faq_lines.append(f"A: {faq.answer}")
            faq_lines.append("")
        full_markdown = full_markdown + "\n\n" + "\n".join(faq_lines).strip()

    return Article(
        sections=humanized_sections,
        full_markdown=full_markdown,
        word_count=len(full_markdown.split()),
        faqs=faqs,
    )


def enrich_seo(
    article: Article, keyword_analysis: KeywordAnalysis
) -> tuple[SEOMetadata, list[LinkingSuggestion], list[ExternalReference]]:
    secondary = ", ".join(keyword_analysis.secondary_keywords)
    # Pass just section headings to keep prompt size reasonable
    headings = "\n".join(
        f"{'#' * s.level} {s.heading}" for s in article.sections
    )
    system = (
        "You are an SEO specialist. "
        "Respond ONLY with a valid JSON object, no explanation."
    )
    user = f"""Given this article about "{keyword_analysis.primary_keyword}", provide SEO enrichment data.

Article headings:
{headings}

Secondary keywords: {secondary}

Return a JSON object with this exact structure:
{{
  "seo_metadata": {{
    "title_tag": "...",
    "meta_description": "..."
  }},
  "internal_links": [
    {{
      "anchor_text": "...",
      "suggested_target": "/relevant-page-slug",
      "context_note": "..."
    }}
  ],
  "external_references": [
    {{
      "source_name": "...",
      "url": "https://...",
      "placement_context": "..."
    }}
  ]
}}

Requirements:
- title_tag: 50-60 characters, include primary keyword near the start
- meta_description: 150-160 characters, compelling, include primary keyword
- internal_links: 3-5 suggestions for internal linking opportunities
- external_references: 2-4 authoritative external sources to cite (use real, well-known sources)"""

    data = _call_claude("claude-sonnet-4-6", system, user)
    seo_metadata = SEOMetadata(**data["seo_metadata"])
    internal_links = [LinkingSuggestion(**l) for l in data["internal_links"]]
    external_references = [ExternalReference(**r) for r in data["external_references"]]
    return seo_metadata, internal_links, external_references
