from __future__ import annotations

import json
import os
import sqlite3
import uuid
from datetime import datetime, timezone

from .models import FAQ, ArticleOutput, Job, JobStatus, SERPResult


def _get_db_path() -> str:
    return os.getenv("DB_PATH", "seo_jobs.db")


def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(_get_db_path())
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                status TEXT NOT NULL,
                keyword TEXT NOT NULL,
                target_word_count INTEGER NOT NULL,
                language TEXT NOT NULL,
                serp_data TEXT,
                output_json TEXT,
                error_message TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                completed_at TEXT
            )
        """)


def _row_to_job(row: sqlite3.Row) -> Job:
    return Job(
        id=row["id"],
        status=JobStatus(row["status"]),
        keyword=row["keyword"],
        target_word_count=row["target_word_count"],
        language=row["language"],
        serp_data=row["serp_data"],
        output_json=row["output_json"],
        error_message=row["error_message"],
        created_at=datetime.fromisoformat(row["created_at"]),
        updated_at=datetime.fromisoformat(row["updated_at"]),
        completed_at=datetime.fromisoformat(row["completed_at"]) if row["completed_at"] else None,
    )


def create_job(keyword: str, word_count: int, language: str) -> Job:
    now = datetime.now(timezone.utc)
    job_id = str(uuid.uuid4())
    with _conn() as conn:
        conn.execute(
            """
            INSERT INTO jobs (id, status, keyword, target_word_count, language, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (job_id, JobStatus.pending.value, keyword, word_count, language,
             now.isoformat(), now.isoformat()),
        )
    return get_job(job_id)


def get_job(job_id: str) -> Job | None:
    with _conn() as conn:
        row = conn.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
    return _row_to_job(row) if row else None


def update_status(job_id: str, status: JobStatus, error_message: str | None = None) -> None:
    now = datetime.now(timezone.utc).isoformat()
    completed_at = now if status == JobStatus.completed else None
    with _conn() as conn:
        conn.execute(
            """
            UPDATE jobs
            SET status = ?, error_message = ?, updated_at = ?, completed_at = COALESCE(?, completed_at)
            WHERE id = ?
            """,
            (status.value, error_message, now, completed_at, job_id),
        )


def set_serp_data(job_id: str, results: list[SERPResult], faqs: list[FAQ]) -> None:
    now = datetime.now(timezone.utc).isoformat()
    data = json.dumps({
        "results": [r.model_dump() for r in results],
        "faqs": [f.model_dump() for f in faqs],
    })
    with _conn() as conn:
        conn.execute(
            "UPDATE jobs SET serp_data = ?, updated_at = ? WHERE id = ?",
            (data, now, job_id),
        )


def get_serp_data(job_id: str) -> tuple[list[SERPResult], list[FAQ]] | None:
    with _conn() as conn:
        row = conn.execute("SELECT serp_data FROM jobs WHERE id = ?", (job_id,)).fetchone()
    if row is None or row["serp_data"] is None:
        return None
    payload = json.loads(row["serp_data"])
    results = [SERPResult(**r) for r in payload["results"]]
    faqs = [FAQ(**f) for f in payload["faqs"]]
    return results, faqs


def set_output(job_id: str, output: ArticleOutput) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with _conn() as conn:
        conn.execute(
            "UPDATE jobs SET output_json = ?, updated_at = ? WHERE id = ?",
            (output.model_dump_json(), now, job_id),
        )


def list_jobs(limit: int = 50) -> list[Job]:
    with _conn() as conn:
        rows = conn.execute(
            "SELECT * FROM jobs ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
    return [_row_to_job(r) for r in rows]


def get_output(job_id: str) -> ArticleOutput | None:
    with _conn() as conn:
        row = conn.execute("SELECT output_json FROM jobs WHERE id = ?", (job_id,)).fetchone()
    if row is None or row["output_json"] is None:
        return None
    return ArticleOutput.model_validate_json(row["output_json"])
