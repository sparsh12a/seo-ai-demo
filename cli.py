from __future__ import annotations

import argparse
import sys

from dotenv import load_dotenv

load_dotenv()

from seo_agent import db
from seo_agent.orchestrator import run_job


def main() -> None:
    parser = argparse.ArgumentParser(description="SEO AI — generate optimized articles")
    parser.add_argument("--keyword", required=True, help="Target keyword")
    parser.add_argument("--word-count", type=int, default=1500, help="Target word count")
    parser.add_argument("--language", default="en", help="Language code (default: en)")
    args = parser.parse_args()

    db.init_db()
    keyword = args.keyword.strip().rstrip('.,!?')
    job = db.create_job(keyword, args.word_count, args.language)
    print(f"Job created: {job.id}")
    print(f"Keyword:     {job.keyword}")
    print(f"Word count:  {job.target_word_count}")
    print()
    print("Running pipeline...")

    try:
        output = run_job(str(job.id))
    except Exception as exc:
        print(f"\nFailed: {exc}", file=sys.stderr)
        sys.exit(1)

    print()
    print("=" * 60)
    print("RESULT SUMMARY")
    print("=" * 60)
    print(f"Job ID:       {job.id}")
    print(f"Status:       completed")
    print(f"Title Tag:    {output.seo_metadata.title_tag}")
    print(f"Meta Desc:    {output.seo_metadata.meta_description}")
    print(f"Word Count:   {output.article.word_count}")
    print(f"Sections:     {len(output.article.sections)}")
    print(f"Secondary KW: {', '.join(output.keyword_analysis.secondary_keywords)}")

    qr = output.quality_report
    check_symbols = "  ".join(
        f"{name} {'✓' if passed else '✗'}"
        for name, passed in qr.checks.items()
    )
    print(f"Quality Score: {qr.overall_score:.2f}  ({check_symbols})")
    print(f"Revisions:     {output.revision_attempts} attempt(s)")
    print(f"FAQ Count:     {len(output.article.faqs)}")
    if qr.feedback:
        print(f"WARNING — failed checks: {qr.feedback}", file=sys.stderr)

    print()
    print("Internal Link Suggestions:")
    for link in output.internal_links:
        print(f"  [{link.anchor_text}] -> {link.suggested_target}")
    print()
    print("External References:")
    for ref in output.external_references:
        print(f"  {ref.source_name}: {ref.url}")


if __name__ == "__main__":
    main()
