from __future__ import annotations

import os
import re

from serpapi import GoogleSearch

from .context import serp_key as _ctx_serp_key
from .models import FAQ, SERPResult

_PAA_PATTERN = re.compile(r'((?:What|How|Why|When|Is|Can|Does|Are)[^.?]+\?)')


def fetch_serp(keyword: str) -> tuple[list[SERPResult], list[FAQ]]:
    api_key = _ctx_serp_key.get() or os.environ.get("SERPAPI_KEY", "")
    search = GoogleSearch({
        "q": keyword,
        "api_key": api_key,
        "num": 10,
        "hl": "en",
        "gl": "us",
    })
    raw = search.get_dict()
    organic = raw.get("organic_results", [])

    results = []
    for i, item in enumerate(organic[:10], start=1):
        results.append(SERPResult(
            rank=i,
            url=item.get("link", ""),
            title=item.get("title", ""),
            snippet=item.get("snippet", ""),
        ))

    # Extract FAQs from People Also Ask
    faqs: list[FAQ] = []
    for paa in raw.get("related_questions", []):
        faqs.append(FAQ(
            question=paa.get("question", ""),
            answer=paa.get("snippet", ""),
        ))

    # Fallback: regex-scan organic snippets
    if not faqs:
        seen: set[str] = set()
        for item in organic:
            snippet = item.get("snippet", "")
            for match in _PAA_PATTERN.findall(snippet):
                if match not in seen:
                    seen.add(match)
                    faqs.append(FAQ(question=match, answer=""))
                if len(faqs) >= 5:
                    break
            if len(faqs) >= 5:
                break

    return results, faqs
